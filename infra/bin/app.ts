import { App } from "aws-cdk-lib";
import { CampusAiStack } from "../lib/campus-ai-stack.js";

const app = new App();

new CampusAiStack(app, "CampusAiAssistant", {
  googleClientId: app.node.tryGetContext("googleClientId") ?? "PLACEHOLDER",
  googleClientSecret: app.node.tryGetContext("googleClientSecret") ?? "PLACEHOLDER",
  bedrockModelId: app.node.tryGetContext("bedrockModelId") ?? "anthropic.claude-sonnet-4-20250514",
  ingestPrincipalArn: app.node.tryGetContext("ingestPrincipalArn") ?? "arn:aws:iam::123456789012:root",
  skipBuild: app.node.tryGetContext("skipBuild") === "true",
});
