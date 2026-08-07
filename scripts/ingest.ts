// Indexes campus datasets into Meilisearch.
// Exits non-zero on any module failure.
import { dataStore } from "../src/server/data";
import { runIngest } from "../src/server/ingest";
import { modules } from "../src/server/modules";
import { getSearch } from "../src/server/search";

runIngest(modules, getSearch(), dataStore())
  .then(() => console.log("Ingest complete."))
  .catch((e) => {
    console.error("Ingest failed:", e);
    process.exit(1);
  });
