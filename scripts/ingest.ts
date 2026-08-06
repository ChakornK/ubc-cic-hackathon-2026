// npm run ingest — registry-driven indexing of the Data_Bucket into OpenSearch
// (4.2, 4.3). Exits non-zero on any module failure.
import { runIngest } from "../src/server/ingest";
import { modules } from "../src/server/modules";
import { dataBucket } from "../src/server/s3";
import { getOpenSearch } from "../src/server/search";

runIngest(modules, getOpenSearch(), dataBucket())
  .then(() => console.log("Ingest complete."))
  .catch((e) => {
    console.error("Ingest failed:", e);
    process.exit(1);
  });
