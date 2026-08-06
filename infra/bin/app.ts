import { App } from "aws-cdk-lib";
import { CampusAiStack } from "../lib/campus-ai-stack.js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

// Bare model ID required — the stack builds an IAM resource ARN from it.
// Cross-region prefixes (e.g. "us.anthropic...") or version suffixes (":0") break the ARN.
const BEDROCK_MODEL_ID_PATTERN = /^[a-z][a-z0-9.-]+[a-z0-9]$/;

function resolveBedrockModelId(): string {
  const id = requireEnv("BEDROCK_MODEL_ID");
  if (!BEDROCK_MODEL_ID_PATTERN.test(id)) {
    throw new Error(
      `Invalid BEDROCK_MODEL_ID "${id}". Must be a bare model ID (e.g. "anthropic.claude-haiku-4-5-20251001-v1"), not a cross-region profile or versioned ARN.`,
    );
  }
  return id;
}

const app = new App();

new CampusAiStack(app, "CampusAiAssistant", {
  googleClientId: requireEnv("GOOGLE_CLIENT_ID"),
  googleClientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
  bedrockModelId: resolveBedrockModelId(),
  ingestPrincipalArn: requireEnv("INGEST_PRINCIPAL_ARN"),
  callbackUrl: requireEnv("CALLBACK_URL"),
  cognitoDomainPrefix: requireEnv("COGNITO_DOMAIN_PREFIX"),
  skipBuild: process.env.SKIP_BUILD === "true",
});
