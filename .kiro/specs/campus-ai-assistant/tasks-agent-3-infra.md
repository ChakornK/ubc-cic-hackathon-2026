# Tasks — Agent 3: Infrastructure & Delivery

**Owns**: `infra/**`, root `README.md`, `scripts/smoke.ts`.
**Must not touch**: `src/server/**`, `app/api/**` (Agent 1), UI code (Agent 2).
**Blocked on**: nothing to start (the `infra/` workspace is independent). The first real `cdk deploy` of the `Nextjs` construct needs the app to build — coordinate with Agent 1 (any compiling state after their task 1.1 suffices). The smoke test needs both other agents done.

## Tasks

- [ ] 1. CDK stack
  - [ ] 1.1 Implement the CDK stack
    - Cognito user pool + Google IdP + hosted-UI domain + app client (auth-code flow, callback to the CloudFront URL); `Nextjs` construct from `cdk-nextjs` (OpenNext) building the app onto a `NODEJS_24_X` server Lambda + CloudFront + S3 assets, with raised origin read timeout; server env vars `BEDROCK_MODEL_ID`, `OPENSEARCH_ENDPOINT`, `TABLE_NAME`, `DATA_BUCKET` + Cognito pool/client IDs; DynamoDB table (on-demand); `t3.small.search` OpenSearch domain (access policy: server role + developer ingest principal); S3 data bucket (block public access)
    - _Requirements: 1.1, 8.1, 8.3_
  - [ ] 1.2 Implement the least-privilege server role
    - Grants only: `bedrock:InvokeModel` on the model, read/write on the table, `es:ESHttpGet`/`es:ESHttpPost` on the domain, `s3:GetObject` on the data bucket
    - _Requirements: 8.2_
  - [ ]* 1.3 Write CDK assertion tests
    - User pool has a Google IdP; server Lambda env vars set; IAM policy contains only the four grants
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 2. Documentation
  - [ ] 2.1 Write the README
    - Deploy steps (`cdk deploy`, first-deploy Google OAuth callback wiring), data sync + ingestion procedure (`npm run sync-data`, `npm run ingest`), Google OAuth setup (console steps, redirect URIs), and a sample request whose question requires at least two tool calls
    - _Requirements: 8.4_

- [ ] 3. Verification
  - [ ]* 3.1 Write the integration smoke script
    - `scripts/smoke.ts` against the deployed stack: send the README sample question with a valid token, assert 200 with ≥2 `tool_calls`; each of the four tools returns a non-empty result; re-run ingest and assert index doc counts unchanged
    - _Requirements: 4.2, 4.3_

- [ ] 4. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- No PBT for IaC — CDK assertions + the smoke script only
- Corresponds to master tasks 10 and 12 in `tasks.md`
- Task 3.1 runs last: it needs Agent 1's handlers + ingest and this stack deployed

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["1.3"] },
    { "id": 3, "tasks": ["3.1"] }
  ]
}
```
