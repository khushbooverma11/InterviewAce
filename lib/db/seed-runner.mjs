import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import { rm, mkdir } from "node:fs/promises";

const dir = path.dirname(fileURLToPath(import.meta.url));
const outfile = path.resolve(dir, ".seed-tmp/seed.mjs");

async function run() {
  await mkdir(path.dirname(outfile), { recursive: true });
  await esbuild({
    entryPoints: [path.resolve(dir, "src/seed.ts")],
    platform: "node",
    bundle: true,
    format: "esm",
    outfile,
    logLevel: "info",
    packages: "external",
  });
  await import(outfile);
  await rm(path.resolve(dir, ".seed-tmp"), { recursive: true, force: true });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
