import fs from "node:fs";
import path from "node:path";

export function assertInquiryWritable() {
  const coordination = process.env.RECOVERY_COORDINATION_DIR;
  if (!coordination && process.env.NODE_ENV !== "production") return;
  const unavailable = () => new Error("RECOVERY_COORDINATION_UNAVAILABLE");
  let mode: string;
  try {
    if (!coordination || !path.isAbsolute(coordination)
      || fs.realpathSync(coordination) !== path.resolve(coordination)) throw unavailable();
    const file = path.join(coordination, "state.json");
    const named = fs.lstatSync(file);
    if (!named.isFile() || named.nlink !== 1 || named.size > 8192) throw unavailable();
    const descriptor = fs.openSync(file, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0));
    try {
      const opened = fs.fstatSync(descriptor);
      if ((process.platform !== "win32" && opened.dev !== named.dev)
        || opened.ino !== named.ino || opened.size > 8192) throw unavailable();
      const state = JSON.parse(fs.readFileSync(descriptor, "utf8"));
      if (!state || !["NORMAL", "READ_ONLY", "MAINTENANCE"].includes(state.mode)
        || typeof state.updatedAt !== "string" || !Number.isFinite(Date.parse(state.updatedAt))) throw unavailable();
      mode = state.mode;
    } finally {
      fs.closeSync(descriptor);
    }
  } catch {
    throw unavailable();
  }
  // A malformed or dangling maintenance marker still closes write admission.
  try {
    fs.lstatSync(path.join(coordination!, "deployment-maintenance.json"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      if (mode !== "NORMAL") throw new Error("SYSTEM_RECOVERY_READ_ONLY");
      return;
    }
    throw unavailable();
  }
  throw new Error("DEPLOYMENT_MAINTENANCE");
}
