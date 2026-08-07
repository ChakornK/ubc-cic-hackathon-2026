import { App } from "aws-cdk-lib";
import { ReogentStack } from "../lib/campus-ai-stack.js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

// Model ID or inference profile ID (e.g. "us.anthropic.claude-haiku-4-5-20251001-v1:0").
const BEDROCK_MODEL_ID_PATTERN = /^[a-z][a-z0-9.:-]+[a-z0-9]$/;

function resolveBedrockModelId(): string {
  const id = requireEnv("BEDROCK_MODEL_ID");
  if (!BEDROCK_MODEL_ID_PATTERN.test(id)) {
    throw new Error(
      `Invalid BEDROCK_MODEL_ID "${id}". Must be a model ID or inference profile (e.g. "us.anthropic.claude-haiku-4-5-20251001-v1:0").`,
    );
  }
  return id;
}

const app = new App();

new ReogentStack(app, "ReogentStack", {
  googleClientId: requireEnv("GOOGLE_CLIENT_ID"),
  googleClientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
  bedrockModelId: resolveBedrockModelId(),
  ingestPrincipalArn: requireEnv("INGEST_PRINCIPAL_ARN"),
  callbackUrl: requireEnv("CALLBACK_URL"),
  cognitoDomainPrefix: requireEnv("COGNITO_DOMAIN_PREFIX"),
  skipBuild: process.env.SKIP_BUILD === "true",
});
