import { constants } from "node:fs";
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export async function readStdin(): Promise<string> {
  return await Bun.stdin.text();
}

export function hasStdinData(): boolean {
  return !process.stdin.isTTY;
}

export async function writeEnvFile(targetPath: string, content: string, force = false): Promise<string> {
  const resolvedPath = path.resolve(process.cwd(), targetPath);

  if (!force) {
    try {
      await access(resolvedPath, constants.F_OK);
      throw new Error(`File already exists: ${resolvedPath}. Use --force to overwrite it.`);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("File already exists:")) {
        throw error;
      }
    }
  }

  await mkdir(path.dirname(resolvedPath), { recursive: true });
  await writeFile(resolvedPath, `${content}\n`, { encoding: "utf8", mode: 0o600 });

  return resolvedPath;
}
