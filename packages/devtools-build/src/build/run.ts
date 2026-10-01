import { spawnSync } from "node:child_process"

/**
 * Run jobs one after another, in the given order.
 *
 * A build must wait for the job before it, so the steps stay a chain rather than a parallel batch.
 */
export async function sequence<T>(
  items: T[],
  run: (item: T) => Promise<void>,
  index = 0,
): Promise<void> {
  if (index >= items.length) return
  await run(items[index])
  await sequence(items, run, index + 1)
}

/**
 * Run a package manager script in a package directory.
 *
 * It runs `pnpm run <script>` there through a shell, with the output streamed to the caller.
 * The shell is what resolves the pnpm launcher on Windows, where it is a command script,
 * and the script name is one of two fixed values, so no caller input reaches the command.
 * A non-zero exit rejects, so a failed dependency stops the build.
 */
export function runScript(dir: string, script: string): Promise<void> {
  return new Promise((settle, fail) => {
    const result = spawnSync(`pnpm run ${script}`, {
      cwd: dir,
      stdio: "inherit",
      shell: true,
    })
    if (result.error) fail(result.error)
    else if (result.status === 0) settle()
    else fail(new Error(`vinocss-build: ${script} failed in ${dir}`))
  })
}
