import { App } from "aws-cdk-lib";
import { CampusAiStack } from "../lib/campus-ai-stack.js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const app = new App();

new CampusAiStack(app, "CampusAiAssistant", {
  googleClientId: requireEnv("GOOGLE_CLIENT_ID"),
  googleClientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
  bedrockModelId: process.env.BEDROCK_MODEL_ID ?? "anthropic.claude-haiku-4-5-20251001-v1",
  ingestPrincipalArn: requireEnv("INGEST_PRINCIPAL_ARN"),
  callbackUrl: requireEnv("CALLBACK_URL"),
  cognitoDomainPrefix: requireEnv("COGNITO_DOMAIN_PREFIX"),
  skipBuild: process.env.SKIP_BUILD === "true",
});
