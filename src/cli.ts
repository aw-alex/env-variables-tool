#!/usr/bin/env bun
import clipboardy from "clipboardy";
import { parseArgs } from "./args";
import { createEnvDocument } from "./env-document";
import { hasStdinData, readStdin, writeEnvFile } from "./io";
import { runTui } from "./tui";

const options = parseArgs(Bun.argv.slice(2));

if (!hasStdinData()) {
  await runTui(options.prefix);
} else {
  const raw = await readStdin();
  const document = createEnvDocument(raw, options.prefix);

  if (document.result.variables.length === 0) {
    console.error(`No variables found for prefix ${options.prefix}`);
    process.exit(1);
  }

  if (options.copy) {
    await clipboardy.write(document.output);
    console.error(`Copied ${document.result.variables.length} variable(s) to clipboard.`);
  }

  if (options.output) {
    const resolvedPath = await writeEnvFile(options.output, document.output, options.force);
    console.error(`Saved ${document.result.variables.length} variable(s) to ${resolvedPath}.`);
  }

  if (!options.copy && !options.output) {
    console.log(document.output);
  }

  if (document.result.duplicates.length > 0) {
    console.error(`Duplicate variables replaced with latest value: ${document.result.duplicates.join(", ")}`);
  }
}
