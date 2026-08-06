import { App, Stack } from "aws-cdk-lib";

// Placeholder so `cdk synth` works from day one.
// Agent 3 replaces this with the real stack (see tasks-agent-3-infra.md).
const app = new App();
new Stack(app, "CampusAiAssistant");
