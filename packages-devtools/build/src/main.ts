#!/usr/bin/env node
import { Command } from "commander"
import { build } from "@/index"

async function main(): Promise<void> {
  const program = new Command()
    .name("vinocss-build")
    .description("build the library and binary entries of a VinoCSS package")
    .option("--lib <names>", "extra library entries, comma separated", collect, [])
    .option("--bin <names>", "extra binary entries, comma separated", collect, [])
    .option("--out <dir>", "output directory", "out")
    .action(async (options: { lib: string[]; bin: string[]; out: string }) => {
      await build({ lib: options.lib, bin: options.bin, outDir: options.out })
    })

  await program.parseAsync()
}

/**
 * Collect a comma-separated option across repeats.
 *
 * Commander calls it once per flag with the values seen so far,
 * so `--lib a,b --lib c` and `--lib a,b,c` both yield `[a, b, c]`.
 * A piece with only spaces is dropped, so a trailing comma or a blank entry is harmless.
 */
function collect(value: string, previous: string[]): string[] {
  return [
    ...previous,
    ...value
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean),
  ]
}

await main()
