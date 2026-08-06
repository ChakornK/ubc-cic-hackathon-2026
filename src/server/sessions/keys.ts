// Single-table DynamoDB keys. Every PK starts with the caller's sub, so
// cross-user reads are structurally impossible (Requirements 5.3, 5.4).

export const userPk = (sub: string) => `USER#${sub}`;

export const sessionSk = (sessionId: string) => `SESSION#${sessionId}`;

/** Zero-padded seq so lexicographic SK order equals chronological order. */
export const messageSk = (sessionId: string, seq: number) =>
  `${sessionSk(sessionId)}#MSG#${String(seq).padStart(6, "0")}`;

export const MSG_MARKER = "#MSG#";
