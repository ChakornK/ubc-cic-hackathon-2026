import { beforeEach, describe, expect, it, vi } from "vitest";

const send = vi.fn();
vi.mock("@aws-sdk/lib-dynamodb", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@aws-sdk/lib-dynamodb")>();
  return { ...actual, DynamoDBDocumentClient: { from: () => ({ send }) } };
});

process.env.TABLE_NAME = "test-table";
const { getSessionMessages, listSessions } = await import("./store");

beforeEach(() => send.mockReset());

describe("session store", () => {
  it("lists only session metadata, newest first (5.2)", async () => {
    send.mockResolvedValueOnce({
      Items: [
        { SK: "SESSION#a", title: "older", updatedAt: "2026-08-01T00:00:00Z" },
        { SK: "SESSION#a#MSG#000000", role: "user", content: "hi" }, // must be filtered out
        { SK: "SESSION#b", title: "newer", updatedAt: "2026-08-05T00:00:00Z" },
      ],
    });
    expect(await listSessions("u1")).toEqual([
      { session_id: "b", title: "newer", updatedAt: "2026-08-05T00:00:00Z" },
      { session_id: "a", title: "older", updatedAt: "2026-08-01T00:00:00Z" },
    ]);
  });

  it("returns history in chronological order and only under the caller's PK (5.3, 5.4)", async () => {
    send.mockResolvedValueOnce({
      Items: [
        { SK: "SESSION#s#MSG#000000", role: "user", content: "q" },
        { SK: "SESSION#s#MSG#000001", role: "assistant", content: "a" },
      ],
    });
    expect(await getSessionMessages("u1", "s")).toEqual([
      { role: "user", content: "q" },
      { role: "assistant", content: "a" },
    ]);
    const query = send.mock.calls[0][0].input;
    expect(query.ExpressionAttributeValues[":pk"]).toBe("USER#u1");
  });

  it("returns null for a session that doesn't exist under the caller (5.4)", async () => {
    send.mockResolvedValueOnce({ Items: [] }); // no messages
    send.mockResolvedValueOnce({}); // no metadata item either
    expect(await getSessionMessages("u1", "not-mine")).toBeNull();
  });
});
