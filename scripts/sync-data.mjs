// npm run sync-data — uploads the Unified-UBC-Data tree to the Data_Bucket (4.1).
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const bucket = process.env.DATA_BUCKET;
if (!bucket) {
  console.error("Set DATA_BUCKET to the data bucket name, e.g. DATA_BUCKET=my-bucket npm run sync-data");
  process.exit(1);
}

const src = process.env.UBC_DATA_DIR ?? fileURLToPath(new URL("../../Unified-UBC-Data/data", import.meta.url));
if (!existsSync(src)) {
  console.error(`Source data dir not found: ${src} (set UBC_DATA_DIR to the Unified-UBC-Data data/ folder)`);
  process.exit(1);
}

const res = spawnSync("aws", ["s3", "sync", src, `s3://${bucket}/data/`], {
  stdio: "inherit",
  shell: process.platform === "win32",
});
process.exit(res.status ?? 1);
