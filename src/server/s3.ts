import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { S3Writer } from "./core/types";

/** Every dataset key is relative to this prefix inside the Data_Bucket
 *  (`npm run sync-data` uploads the source tree under `data/`). */
export const DATA_PREFIX = "data/";

let s3: S3Client | undefined;

export function getS3(): S3Client {
  s3 ??= new S3Client({});
  return s3;
}

export function dataBucket(bucket = process.env.DATA_BUCKET): S3Writer {
  if (!bucket) throw new Error("DATA_BUCKET env var is not set");
  return {
    async getJson(key) {
      const res = await getS3().send(new GetObjectCommand({ Bucket: bucket, Key: DATA_PREFIX + key }));
      if (!res.Body) throw new Error(`Empty S3 object: ${DATA_PREFIX + key}`);
      return JSON.parse(await res.Body.transformToString());
    },
    async putJson(key, value) {
      await getS3().send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: DATA_PREFIX + key,
          Body: JSON.stringify(value),
          ContentType: "application/json",
        }),
      );
    },
  };
}
