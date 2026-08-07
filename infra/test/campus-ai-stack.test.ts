import { App, Stack } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { describe, expect, it, vi } from "vitest";
import { ReogentStack } from "../lib/campus-ai-stack";

// Mock cdk-nextjs-standalone so it doesn't attempt a Next.js build during synth.
// The mock creates a real Lambda function the stack can attach policies and env vars to.
vi.mock("cdk-nextjs-standalone", () => {
  return {
    Nextjs: class MockNextjs {
      public readonly url: string;
      public readonly serverFunction: { lambdaFunction: lambda.Function };

      constructor(scope: Construct, id: string, props: Record<string, unknown>) {
        const fn = new lambda.Function(scope, `${id}ServerFn`, {
          runtime: lambda.Runtime.NODEJS_20_X,
          handler: "index.handler",
          code: lambda.Code.fromInline("exports.handler = () => {}"),
          environment: (props.environment as Record<string, string>) ?? {},
        });
        this.serverFunction = { lambdaFunction: fn };
        this.url = "https://mock.cloudfront.net";
      }
    },
  };
});

const DEFAULT_PROPS = {
  googleClientId: "test-google-id",
  googleClientSecret: "test-google-secret",
  bedrockModelId: "anthropic.claude-sonnet-4-20250514",
  ingestPrincipalArn: "arn:aws:iam::123456789012:role/IngestRole",
  callbackUrl: "https://example.cloudfront.net/",
  cognitoDomainPrefix: "test-campus-ai",
  skipBuild: true,
};

function createTemplate(): Template {
  const app = new App();
  const stack = new ReogentStack(app, "TestStack", {
    ...DEFAULT_PROPS,
    env: { account: "123456789012", region: "us-west-2" },
  });
  return Template.fromStack(stack);
}

describe("ReogentStack", () => {
  const template = createTemplate();

  it("user pool has a Google identity provider", () => {
    template.hasResourceProperties("AWS::Cognito::UserPoolIdentityProvider", {
      ProviderName: "Google",
      ProviderType: "Google",
    });
  });

  it("server Lambda has required environment variables", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      Environment: {
        Variables: Match.objectLike({
          BEDROCK_MODEL_ID: DEFAULT_PROPS.bedrockModelId,
          OPENSEARCH_ENDPOINT: Match.anyValue(),
          TABLE_NAME: Match.anyValue(),
          DATA_BUCKET: Match.anyValue(),
          COGNITO_USER_POOL_ID: Match.anyValue(),
        }),
      },
    });
  });

  it("server role has bedrock:InvokeModel permission", () => {
    template.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: "bedrock:InvokeModel",
            Effect: "Allow",
          }),
        ]),
      },
    });
  });

  it("server role has DynamoDB read/write permission", () => {
    template.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: Match.arrayWith([
              "dynamodb:BatchGetItem",
              "dynamodb:GetItem",
              "dynamodb:PutItem",
              "dynamodb:DeleteItem",
            ]),
            Effect: "Allow",
          }),
        ]),
      },
    });
  });

  it("server role has OpenSearch es:ESHttpGet and es:ESHttpPost permission", () => {
    template.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: ["es:ESHttpGet", "es:ESHttpPost"],
            Effect: "Allow",
          }),
        ]),
      },
    });
  });

  it("server role has s3:GetObject on the data bucket", () => {
    template.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: Match.arrayWith(["s3:GetObject*"]),
            Effect: "Allow",
          }),
        ]),
      },
    });
  });
});
