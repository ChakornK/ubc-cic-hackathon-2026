export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { migrate } = await import("@/src/server/db/migrate");
    try {
      await migrate();
      console.log("DB migration applied");
    } catch (e) {
      console.error("DB migration failed:", e);
    }
  }
}
