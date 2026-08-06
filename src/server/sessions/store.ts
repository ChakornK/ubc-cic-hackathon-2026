import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { ChatMessage, Profile, SessionSummary, ToolCall } from "../core/types";
import { messageSk, MSG_MARKER, sessionSk, userPk } from "./keys";

let doc: DynamoDBDocumentClient | undefined;

function ddb(): DynamoDBDocumentClient {
  doc ??= DynamoDBDocumentClient.from(new DynamoDBClient({}), {
    marshallOptions: { removeUndefinedValues: true },
  });
  return doc;
}

const table = () => {
  const t = process.env.TABLE_NAME;
  if (!t) throw new Error("TABLE_NAME env var is not set");
  return t;
};

/** The caller's sessions, most recently updated first (5.2). */
export async function listSessions(sub: string): Promise<SessionSummary[]> {
  const res = await ddb().send(
    new QueryCommand({
      TableName: table(),
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      ExpressionAttributeValues: { ":pk": userPk(sub), ":prefix": "SESSION#" },
    }),
  );
  return (res.Items ?? [])
    .filter((item) => !String(item.SK).includes(MSG_MARKER)) // metadata items only
    .map((item) => ({
      session_id: String(item.SK).slice("SESSION#".length),
      title: item.title as string,
      updatedAt: item.updatedAt as string,
    }))
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

/** Chronological history, or null if the session doesn't exist under this
 *  caller's PK — indistinguishable from "someone else's session" (5.4). */
export async function getSessionMessages(sub: string, sessionId: string): Promise<ChatMessage[] | null> {
  const res = await ddb().send(
    new QueryCommand({
      TableName: table(),
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      ExpressionAttributeValues: { ":pk": userPk(sub), ":prefix": `${sessionSk(sessionId)}${MSG_MARKER}` },
    }),
  );
  const items = res.Items ?? [];
  if (items.length === 0) {
    const meta = await ddb().send(
      new GetCommand({ TableName: table(), Key: { PK: userPk(sub), SK: sessionSk(sessionId) } }),
    );
    if (!meta.Item) return null;
  }
  return items.map((item) => ({
    role: item.role as ChatMessage["role"],
    content: item.content as string,
    ...(Array.isArray(item.toolCalls) && item.toolCalls.length > 0 ? { tool_calls: item.toolCalls as ToolCall[] } : {}),
  }));
}

/** Persists one user + assistant exchange and atomically increments the session counter. */
export async function appendExchange(
  sub: string,
  sessionId: string,
  userMessage: string,
  assistantMessage: string,
  toolCalls: ToolCall[],
): Promise<void> {
  const pk = userPk(sub);
  const now = new Date().toISOString();

  // Atomically reserve two sequence slots. The returned messageCount is the
  // value *after* the ADD, so the two new messages occupy (count - 2) and (count - 1).
  const update = await ddb().send(
    new UpdateCommand({
      TableName: table(),
      Key: { PK: pk, SK: sessionSk(sessionId) },
      UpdateExpression:
        "ADD messageCount :inc SET updatedAt = :now, createdAt = if_not_exists(createdAt, :now), title = if_not_exists(title, :title)",
      ExpressionAttributeValues: {
        ":inc": 2,
        ":now": now,
        ":title": userMessage.slice(0, 80),
      },
      ReturnValues: "ALL_NEW",
    }),
  );
  const seq = ((update.Attributes?.messageCount as number) ?? 2) - 2;

  await Promise.all([
    ddb().send(
      new PutCommand({
        TableName: table(),
        Item: { PK: pk, SK: messageSk(sessionId, seq), role: "user", content: userMessage, createdAt: now },
      }),
    ),
    ddb().send(
      new PutCommand({
        TableName: table(),
        Item: {
          PK: pk,
          SK: messageSk(sessionId, seq + 1),
          role: "assistant",
          content: assistantMessage,
          toolCalls,
          createdAt: now,
        },
      }),
    ),
  ]);
}

export async function getProfile(sub: string): Promise<Profile> {
  const res = await ddb().send(new GetCommand({ TableName: table(), Key: { PK: userPk(sub), SK: "PROFILE" } }));
  if (!res.Item) return { preferences: {} };
  const { preferences, email, updatedAt } = res.Item;
  return { preferences: preferences ?? {}, email, updatedAt };
}

export async function putProfile(sub: string, profile: Profile): Promise<void> {
  await ddb().send(
    new PutCommand({
      TableName: table(),
      Item: {
        PK: userPk(sub),
        SK: "PROFILE",
        preferences: profile.preferences ?? {},
        email: profile.email,
        updatedAt: new Date().toISOString(),
      },
    }),
  );
}
