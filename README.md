# Campus AI Assistant

A full-stack Next.js 16 application that answers questions about UBC campus life — courses, tuition, buildings, walking distances — using an AI agent backed by Amazon Bedrock. Deployed to AWS via CDK (OpenNext).

## Architecture

- **Frontend**: Next.js 16, React 19, deck.gl campus map
- **Infrastructure**: cdk-nextjs-standalone (OpenNext) on CloudFront + Lambda
- **Auth**: Amazon Cognito with Google Identity Provider
- **AI**: Amazon Bedrock (Claude via Converse API) with tool use
- **Search**: Amazon OpenSearch for structured campus data
- **Storage**: DynamoDB (chat history), S3 (data assets)

## Prerequisites

- Node.js 24
- AWS CLI configured with sufficient permissions
- Google OAuth 2.0 credentials (see below)

## Google OAuth Setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to APIs & Services > OAuth consent screen. Configure the consent screen (External user type is fine for development).
3. Go to APIs & Services > Credentials > Create Credentials > OAuth 2.0 Client ID.
4. Select **Web application** as the application type.
5. Add authorized redirect URI: `https://{CognitoDomain}/oauth2/idpresponse` (the Cognito domain is output after CDK deploy).
6. Save the Client ID and Client Secret for the deploy step.
7. After CDK deploy completes, add the CloudFront distribution URL from stack outputs as an authorized JavaScript origin and update the redirect URI if needed.

## Deploy

Install dependencies at the repository root:

```bash
npm install
```

Deploy the stack. All config is read from `.env` (see `.env.example`):

```bash
cd infra
npx cdk deploy
```

| Environment Variable    | Required | Description                                                                  |
| ----------------------- | -------- | ---------------------------------------------------------------------------- |
| `GOOGLE_CLIENT_ID`      | Yes      | OAuth 2.0 Client ID from Google Cloud Console                                |
| `GOOGLE_CLIENT_SECRET`  | Yes      | OAuth 2.0 Client Secret                                                      |
| `INGEST_PRINCIPAL_ARN`  | Yes      | IAM principal ARN granted permission to run the ingestion script             |
| `CALLBACK_URL`          | Yes      | OAuth callback URL (your CloudFront URL, e.g. `https://xyz.cloudfront.net/`) |
| `COGNITO_DOMAIN_PREFIX` | Yes      | Cognito hosted UI domain prefix (must be globally unique)                    |
| `BEDROCK_MODEL_ID`      | Yes      | Bedrock model identifier (e.g. `anthropic.claude-haiku-4-5-20251001-v1`)     |
| `SKIP_BUILD`            | No       | Set to `true` to skip the Next.js build during synth                         |

On first deploy, set `CALLBACK_URL=http://localhost:3000/`. After deploy completes, update it to the CloudFront URL from stack outputs and redeploy.

After deploy completes, copy the stack outputs into your `.env` file (see `.env.example`):

| Environment Variable   | Source (Stack Output) | Used By                       |
| ---------------------- | --------------------- | ----------------------------- |
| `COGNITO_USER_POOL_ID` | `UserPoolId`          | Local dev, token verification |
| `COGNITO_CLIENT_ID`    | `UserPoolClientId`    | Local dev, token verification |
| `COGNITO_DOMAIN`       | `CognitoDomain`       | Local dev, OAuth flow         |
| `OPENSEARCH_ENDPOINT`  | `OpenSearchEndpoint`  | Ingest script, smoke tests    |
| `TABLE_NAME`           | `TableName`           | Local dev                     |
| `DATA_BUCKET`          | `DataBucketName`      | Ingest script, sync-data      |
| `STACK_URL`            | `CloudFrontUrl`       | Smoke tests                   |

## Data Sync and Ingestion

Sync the Unified-UBC-Data repository's `data/` directory to the S3 Data Bucket:

```bash
npm run sync-data
```

Index the datasets into OpenSearch (courses, tuition, buildings, walking distances):

```bash
npm run ingest
```

Both commands are idempotent. Re-running produces no duplicates.

## Local Development

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

## Sample Request

A query that exercises multiple tools in a single response:

```
How long is the walk from the Buchanan building to the ICICS building,
and what Computer Science courses have no prerequisites?
```

This triggers both the `walking_distance` and `search_courses` tools, demonstrating the agent's multi-tool orchestration.
