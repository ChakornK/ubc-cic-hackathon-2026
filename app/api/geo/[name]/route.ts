import { GetObjectCommand } from "@aws-sdk/client-s3";
import { requireUser } from "@/src/server/auth";
import { modules } from "@/src/server/modules";
import { DATA_PREFIX, getS3 } from "@/src/server/s3";
import { json, serverError } from "../../http";

export async function GET(request: Request, { params }: { params: Promise<{ name: string }> }): Promise<Response> {
  try {
    const user = await requireUser(request);
    if (user instanceof Response) return user;
    const { name } = await params;
    // allowlist = the union of every module's geo entries (7.1)
    const artifact = modules.flatMap((m) => m.geo ?? []).find((g) => g.name === name);
    if (!artifact) return json({ error: `Unknown geo artifact: ${name}` }, 404);
    const res = await getS3().send(
      new GetObjectCommand({ Bucket: process.env.DATA_BUCKET, Key: DATA_PREFIX + artifact.s3Key }),
    );
    return new Response(res.Body?.transformToWebStream(), {
      headers: { "content-type": "application/geo+json" },
    });
  } catch (e) {
    return serverError(e);
  }
}
