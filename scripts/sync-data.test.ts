import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildLocalInventory, findInventoryProblems, syncData } from "./sync-data.mjs";

const tempDirectories: string[] = [];

function courseFixture() {
  const src = mkdtempSync(path.join(tmpdir(), "sync-data-"));
  tempDirectories.push(src);
  mkdirSync(path.join(src, "courses"));
  writeFileSync(path.join(src, "courses", "courses.json"), '[{"code":"CPSC_V 110"}]');
  writeFileSync(path.join(src, "courses", "sections.json"), '[{"section":"101"}]');
  return src;
}

afterEach(() => {
  for (const directory of tempDirectories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

describe("sync-data", () => {
  it("builds an inventory containing every nested course file", () => {
    const inventory = buildLocalInventory(courseFixture());
    expect(inventory.map((object) => object.Key)).toEqual(["data/courses/courses.json", "data/courses/sections.json"]);
    expect(inventory.every((object) => object.Size > 0)).toBe(true);
  });

  it("reports missing and truncated course uploads", () => {
    const expected = buildLocalInventory(courseFixture());
    const actual = [{ ...expected[0], Size: expected[0].Size - 1 }];

    expect(findInventoryProblems(expected, actual)).toEqual({
      missing: ["data/courses/sections.json"],
      wrongSize: [`data/courses/courses.json (local ${expected[0].Size}, S3 ${expected[0].Size - 1})`],
    });
  });

  it("fails after sync when S3 omits a course file", () => {
    const src = courseFixture();
    const expected = buildLocalInventory(src);
    const spawnSync = vi
      .fn()
      .mockReturnValueOnce({ status: 0 })
      .mockReturnValueOnce({ status: 0, stdout: JSON.stringify([expected[0]]) });

    expect(() => syncData({ bucket: "test-bucket", src, spawnSync })).toThrow(
      "Upload verification failed (missing: data/courses/sections.json)",
    );
    expect(spawnSync.mock.calls[0][1]).toEqual(["s3", "sync", src, "s3://test-bucket/data/"]);
    expect(spawnSync.mock.calls[1][1]).toContain("list-objects-v2");
  });
});
