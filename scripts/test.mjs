import { build } from "esbuild";
import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
const dir = new URL("../.test-build/", import.meta.url);
mkdirSync(dir, { recursive: true });
try {
  const output = new URL("domain.test.mjs", dir);
  await build({
    entryPoints: ["tests/domain.test.ts"],
    bundle: true,
    platform: "node",
    format: "esm",
    outfile: fileURLToPath(output),
    preserveSymlinks: true,
  });
  const result = spawnSync(
    process.execPath,
    ["--test", fileURLToPath(output)],
    { stdio: "inherit", windowsHide: true },
  );
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
