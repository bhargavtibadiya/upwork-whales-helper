import { spawn } from "node:child_process";

const port = 3104,
  base = `http://localhost:${port}`;
const server = spawn("npm", ["start", "--", "--port", String(port)], {
  stdio: ["ignore", "pipe", "pipe"],
  detached: true,
});
server.stdout.on("data", (x) => process.stdout.write(x));
server.stderr.on("data", (x) => process.stderr.write(x));
try {
  let ready = false;
  for (let i = 0; i < 70; i++) {
    try {
      const r = await fetch(base);
      if (r.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  if (!ready) throw new Error("production server not ready");
  for (const script of process.argv.slice(2)) {
    await new Promise((resolve, reject) => {
      const child = spawn("node", [`scripts/${script}`], {
        stdio: "inherit",
        env: {
          ...process.env,
          APP_URL: base,
          EVIDENCE_DIR: `/downloads/production-preview-${script.replace(".mjs", "")}`,
        },
      });
      child.on("exit", (c) => (c ? reject(new Error(`${script} failed ${c}`)) : resolve()));
    });
  }
} finally {
  try {
    process.kill(-server.pid, "SIGTERM");
  } catch {}
}
