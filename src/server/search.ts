import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import { Client } from "@opensearch-project/opensearch";
import { AwsSigv4Signer } from "@opensearch-project/opensearch/aws";
import type { OsClient } from "./core/types";

let client: Client | undefined;

/** SigV4-signed OpenSearch client from env vars (lazy singleton). */
export function getOpenSearch(): Client {
  client ??= new Client({
    ...AwsSigv4Signer({
      region: process.env.AWS_REGION ?? "us-west-2",
      service: "es",
      getCredentials: fromNodeProviderChain(),
    }),
    node: process.env.OPENSEARCH_ENDPOINT,
  });
  return client;
}

export function getOsClient(): OsClient {
  return getOpenSearch() as unknown as OsClient;
}
