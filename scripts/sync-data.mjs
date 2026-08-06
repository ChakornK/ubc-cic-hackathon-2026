// npm run sync-data — uploads and verifies the Unified-UBC-Data tree in the Data_Bucket (4.1).
import { spawnSync as nodeSpawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DATA_PREFIX = "data/";

export function buildLocalInventory(src, prefix = DATA_PREFIX) {
  const objects = [];

  function visit(directory) {
    for (const entry of readdirSync(directory)) {
      const absolutePath = path.join(directory, entry);
      const stats = statSync(absolutePath);
      if (stats.isDirectory()) {
        visit(absolutePath);
      } else if (stats.isFile()) {
        const relativePath = path.relative(src, absolutePath).split(path.sep).join("/");
        objects.push({ Key: `${prefix}${relativePath}`, Size: stats.size });
      }
    }
  }

  visit(src);
  return objects.sort((a, b) => a.Key.localeCompare(b.Key));
}

export function findInventoryProblems(expected, actual) {
  const actualByKey = new Map(actual.map((object) => [object.Key, object.Size]));
  const missing = [];
  const wrongSize = [];

  for (const object of expected) {
    const uploadedSize = actualByKey.get(object.Key);
    if (uploadedSize === undefined) {
      missing.push(object.Key);
    } else if (uploadedSize !== object.Size) {
      wrongSize.push(`${object.Key} (local ${object.Size}, S3 ${uploadedSize})`);
    }
  }

  return { missing, wrongSize };
}

function assertSucceeded(result, action) {
  if (result.error) throw new Error(`${action} failed: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`${action} failed with exit code ${result.status ?? "unknown"}`);
}

export function syncData({ bucket, src, spawnSync = nodeSpawnSync }) {
  const shell = process.platform === "win32";
  const syncResult = spawnSync("aws", ["s3", "sync", src, `s3://${bucket}/${DATA_PREFIX}`], {
    stdio: "inherit",
    shell,
  });
  assertSucceeded(syncResult, "S3 sync");

  const listResult = spawnSync(
    "aws",
    [
      "s3api",
      "list-objects-v2",
      "--bucket",
      bucket,
      "--prefix",
      DATA_PREFIX,
      "--query",
      "Contents[].{Key:Key,Size:Size}",
      "--output",
      "json",
    ],
    { encoding: "utf8", maxBuffer: 10 * 1024 * 1024, shell },
  );
  assertSucceeded(listResult, "S3 inventory listing");

  let actual;
  try {
    actual = JSON.parse(listResult.stdout || "[]") ?? [];
  } catch (error) {
    throw new Error(`Could not parse S3 inventory: ${error.message}`);
  }
  if (!Array.isArray(actual)) throw new Error("Could not parse S3 inventory: expected an array");

  const expected = buildLocalInventory(src);
  const problems = findInventoryProblems(expected, actual);
  if (problems.missing.length > 0 || problems.wrongSize.length > 0) {
    const details = [
      problems.missing.length > 0 ? `missing: ${problems.missing.join(", ")}` : null,
      problems.wrongSize.length > 0 ? `wrong size: ${problems.wrongSize.join(", ")}` : null,
    ].filter(Boolean);
    throw new Error(`Upload verification failed (${details.join("; ")})`);
  }

  return expected.length;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const bucket = process.env.DATA_BUCKET;
  const src = process.env.UBC_DATA_DIR ?? fileURLToPath(new URL("../Unified-UBC-Data/data", import.meta.url));

  try {
    if (!bucket) {
      throw new Error("Set DATA_BUCKET to the data bucket name, e.g. DATA_BUCKET=my-bucket npm run sync-data");
    }
    if (!existsSync(src)) {
      throw new Error(`Source data dir not found: ${src} (set UBC_DATA_DIR to the Unified-UBC-Data data/ folder)`);
    }
    const count = syncData({ bucket, src });
    console.log(`Sync complete: verified ${count} files in s3://${bucket}/${DATA_PREFIX}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
