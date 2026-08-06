/** Shared helpers for the route handlers. */
export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export const serverError = (e: unknown) => {
  console.error(e); // details go to CloudWatch, never to the client (2.9)
  return json({ error: "Internal server error" }, 500);
};
