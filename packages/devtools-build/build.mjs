import { spawnSync } from "node:child_process"

const lib = "package,workspace,log,terminal"
const args = ["--import", "@oxc-node/core/register", "src/main.ts"]
if (process.argv.includes("--self")) args.push("-S")
args.push("-l", lib)
const result = spawnSync(process.execPath, args, { stdio: "inherit" })
process.exitCode = result.status ?? 1
