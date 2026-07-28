import fs from "node:fs";
import path from "node:path";

type RecoveryState = { mode?: "NORMAL" | "READ_ONLY" | "MAINTENANCE" };

export function assertInquiryWritable() {
  const coordination = process.env.RECOVERY_COORDINATION_DIR;
  if (!coordination) return;
  try {
    const state = JSON.parse(fs.readFileSync(path.join(coordination, "state.json"), "utf8")) as RecoveryState;
    if (state.mode && state.mode !== "NORMAL") {
      throw new Error("SYSTEM_RECOVERY_READ_ONLY");
    }
  } catch (error) {
    if (error instanceof Error && error.message === "SYSTEM_RECOVERY_READ_ONLY") throw error;
  }
}
