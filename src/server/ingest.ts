import type { Client } from "@opensearch-project/opensearch";
import type { DatasetModule, S3Writer } from "./core/types";

const BATCH_DOCS = 500;

/** Registry-driven ingest: for every module index — create the mapping if
 *  absent, stream read(), transform to {_id, doc}, bulk index, then run the
 *  derive() hook (Requirements 4.2, 4.3). Throws on any failure so the CLI
 *  can exit non-zero. */
export async function runIngest(modules: DatasetModule[], os: Client, s3: S3Writer): Promise<void> {
  for (const module of modules) {
    for (const idx of module.indices) {
      const exists = await os.indices.exists({ index: idx.index });
      if (!exists.body) {
        await os.indices.create({ index: idx.index, body: { mappings: idx.mappings } });
        console.log(`${idx.index}: created index`);
      } else {
        // Additive: fields added to a module's mappings get their declared type
        // instead of a dynamic guess. Fields that already exist with another
        // type are left as-is (putMapping rejects type changes).
        try {
          await os.indices.putMapping({ index: idx.index, body: idx.mappings });
        } catch (e) {
          console.warn(`${idx.index}: mapping update skipped (${e instanceof Error ? e.message : e})`);
        }
      }

      // biome-ignore lint/suspicious/noExplicitAny: bulk body interleaves action and doc lines
      let batch: Record<string, any>[] = [];
      let count = 0;
      const flush = async () => {
        if (batch.length === 0) return;
        const res = await os.bulk({ body: batch });
        if (res.body.errors) {
          // biome-ignore lint/suspicious/noExplicitAny: opensearch bulk response items
          const bad = (res.body.items as any[]).find((i) => i.index?.error);
          throw new Error(`${idx.index}: bulk index failed: ${JSON.stringify(bad?.index?.error)}`);
        }
        batch = [];
      };

      for await (const raw of idx.read(s3)) {
        const t = idx.transform(raw);
        if (!t) continue;
        batch.push({ index: { _index: idx.index, _id: t._id } }, t.doc as Record<string, unknown>);
        count++;
        if (batch.length >= BATCH_DOCS * 2) await flush();
      }
      await flush();
      console.log(`${idx.index}: indexed ${count} docs`);

      if (idx.derive) {
        await idx.derive(s3);
        console.log(`${idx.index}: derived artifacts written`);
      }
    }
  }
}
