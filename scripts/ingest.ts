// Indexes campus datasets into the search engine.
// Exits non-zero on any module failure.
import { dataStore } from "../src/server/data";
import { runIngest } from "../src/server/ingest";
import { modules } from "../src/server/modules";
import { getOpenSearch } from "../src/server/search";

runIngest(modules, getOpenSearch(), dataStore())
  .then(() => console.log("Ingest complete."))
  .catch((e) => {
    console.error("Ingest failed:", e);
    process.exit(1);
  });
