import * as path from "node:path";
import { CfnOutput, Duration, RemovalPolicy, SecretValue, Stack, type StackProps } from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as opensearch from "aws-cdk-lib/aws-opensearchservice";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Nextjs } from "cdk-nextjs-standalone";
import type { Construct } from "constructs";

export interface CampusAiStackProps extends StackProps {
  /** Google OAuth client ID from the Google Cloud Console. */
  googleClientId: string;
  /** Google OAuth client secret. */
  googleClientSecret: string;
  /** Bedrock model ID, e.g. "anthropic.claude-sonnet-4-20250514". */
  bedrockModelId: string;
  /** IAM principal ARN allowed to ingest data into OpenSearch (developer). */
  ingestPrincipalArn: string;
  /** OAuth callback URL (the app's public URL, e.g. CloudFront distribution). */
  callbackUrl: string;
  /** Cognito hosted UI domain prefix. Must be globally unique. */
  cognitoDomainPrefix: string;
  /** Skip the Next.js build during synth (for tests). */
  skipBuild?: boolean;
}

export class CampusAiStack extends Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly table: dynamodb.Table;
  public readonly searchDomain: opensearch.Domain;
  public readonly dataBucket: s3.Bucket;
  public readonly nextjs: Nextjs;

  constructor(scope: Construct, id: string, props: CampusAiStackProps) {
    super(scope, id, props);

    this.userPool = new cognito.UserPool(this, "UserPool", {
      selfSignUpEnabled: false,
      signInAliases: { email: true },
      // DESTROY is acceptable — pool holds no user data (Google IdP is source of truth).
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const googleIdp = new cognito.UserPoolIdentityProviderGoogle(this, "GoogleIdP", {
      userPool: this.userPool,
      clientId: props.googleClientId,
      // Plaintext in CFN template. Move to Secrets Manager for prod.
      clientSecretValue: SecretValue.unsafePlainText(props.googleClientSecret),
      scopes: ["openid", "email", "profile"],
      attributeMapping: {
        email: cognito.ProviderAttribute.GOOGLE_EMAIL,
        fullname: cognito.ProviderAttribute.GOOGLE_NAME,
      },
    });

    const domainPrefix = props.cognitoDomainPrefix;
    this.userPool.addDomain("HostedUi", {
      cognitoDomain: { domainPrefix },
    });

    // DESTROY — chat history is ephemeral; switch to RETAIN for prod.
    this.table = new dynamodb.Table(this, "SessionTable", {
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // DESTROY — data is re-ingested from S3 source; switch to RETAIN for prod.
    this.dataBucket = new s3.Bucket(this, "DataBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // DESTROY — index is rebuilt by `npm run ingest`; switch to RETAIN for prod.
    // Single node, no replicas. Add zone awareness + 2 nodes if uptime matters.
    this.searchDomain = new opensearch.Domain(this, "SearchDomain", {
      version: opensearch.EngineVersion.OPENSEARCH_2_17,
      capacity: {
        dataNodeInstanceType: "t3.small.search",
        dataNodes: 1,
      },
      ebs: { volumeSize: 20 },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Created before Nextjs so client ID resolves without circular deps.
    this.userPoolClient = this.userPool.addClient("AppClient", {
      supportedIdentityProviders: [cognito.UserPoolClientIdentityProvider.GOOGLE],
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE],
        callbackUrls: [props.callbackUrl, `${props.callbackUrl}chat`],
        logoutUrls: [props.callbackUrl],
      },
    });
    this.userPoolClient.node.addDependency(googleIdp);

    this.nextjs = new Nextjs(this, "Web", {
      nextjsPath: path.resolve(__dirname, "../.."),
      skipBuild: props.skipBuild ?? false,
      streaming: true,
      environment: {
        BEDROCK_MODEL_ID: props.bedrockModelId,
        OPENSEARCH_ENDPOINT: this.searchDomain.domainEndpoint,
        TABLE_NAME: this.table.tableName,
        DATA_BUCKET: this.dataBucket.bucketName,
        COGNITO_USER_POOL_ID: this.userPool.userPoolId,
        COGNITO_CLIENT_ID: this.userPoolClient.userPoolClientId,
      },
      overrides: {
        nextjsDistribution: {
          serverHttpOriginProps: {
            readTimeout: Duration.seconds(60),
          },
        },
      },
    });

    const serverFn = this.nextjs.serverFunction.lambdaFunction;

    // Least-privilege server role — wildcard region for cross-region inference
    const bedrockResources = [
      `arn:aws:bedrock:*::foundation-model/${props.bedrockModelId.replace(/^[a-z]+\./, "")}`,
      `arn:aws:bedrock:us-east-1:${this.account}:inference-profile/${props.bedrockModelId}`,
    ];
    serverFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"],
        resources: bedrockResources,
      }),
    );

    this.table.grantReadWriteData(serverFn);

    serverFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["es:ESHttpGet", "es:ESHttpPost"],
        resources: [this.searchDomain.domainArn + "/*"],
      }),
    );

    this.dataBucket.grantRead(serverFn);

    // OpenSearch access policy: server role + ingest principal
    this.searchDomain.addAccessPolicies(
      new iam.PolicyStatement({
        actions: ["es:ESHttpGet", "es:ESHttpPost"],
        principals: [new iam.ArnPrincipal(serverFn.role!.roleArn)],
        resources: [this.searchDomain.domainArn + "/*"],
      }),
      new iam.PolicyStatement({
        actions: ["es:ESHttp*"],
        principals: [new iam.ArnPrincipal(props.ingestPrincipalArn)],
        resources: [this.searchDomain.domainArn + "/*"],
      }),
    );

    new CfnOutput(this, "CloudFrontUrl", { value: this.nextjs.url });
    new CfnOutput(this, "UserPoolId", { value: this.userPool.userPoolId });
    new CfnOutput(this, "UserPoolClientId", {
      value: this.userPoolClient.userPoolClientId,
    });
    new CfnOutput(this, "CognitoDomain", {
      value: `https://${domainPrefix}.auth.${this.region}.amazoncognito.com`,
    });
    new CfnOutput(this, "OpenSearchEndpoint", {
      value: this.searchDomain.domainEndpoint,
    });
    new CfnOutput(this, "TableName", { value: this.table.tableName });
    new CfnOutput(this, "DataBucketName", {
      value: this.dataBucket.bucketName,
    });
  }
}
