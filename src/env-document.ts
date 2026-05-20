import { extractEnvVariables, formatEnv, type ExtractionResult } from "./parser";

export type EnvDocument = {
  result: ExtractionResult;
  output: string;
};

export type RawInputSummary = {
  charCount: number;
  lineCount: number;
  variableCount: number;
};

export function createEnvDocument(rawInput: string, prefix: string): EnvDocument {
  const result = extractEnvVariables(rawInput, prefix);

  return {
    result,
    output: formatEnv(result),
  };
}

export function createRawInputSummary(rawInput: string, prefix: string): RawInputSummary {
  return {
    charCount: rawInput.length,
    lineCount: rawInput.length === 0 ? 0 : rawInput.split("\n").length,
    variableCount: extractEnvVariables(rawInput, prefix).variables.length,
  };
}

export function createPreview(rawInput: string, prefix: string): string {
  const document = createEnvDocument(rawInput, prefix);

  if (document.output.length === 0) {
    return `No variables found for prefix ${prefix}`;
  }

  const duplicates = document.result.duplicates.length > 0
    ? `\n\nDuplicates replaced with latest value:\n${document.result.duplicates.join(", ")}`
    : "";

  return `${document.output}${duplicates}`;
}

export function createMaskedValuesSummary(document: EnvDocument): string {
  if (document.result.maskedValueNames.length === 0) {
    return "No masked values detected.";
  }

  return document.result.maskedValueNames.join(", ");
}
