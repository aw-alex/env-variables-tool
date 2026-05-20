export type ExtractedVariable = {
  name: string;
  value: string;
  raw: string;
  line: number;
  duplicate: boolean;
};

export type ExtractionResult = {
  variables: ExtractedVariable[];
  duplicates: string[];
  maskedValueNames: string[];
};

const DEFAULT_PREFIX = "NEXT_PUBLIC_";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasMaskedValue(value: string): boolean {
  return value.includes("***");
}

export function extractEnvVariables(input: string, prefix = DEFAULT_PREFIX): ExtractionResult {
  const byName = new Map<string, ExtractedVariable>();
  const duplicatedNames = new Set<string>();
  const assignmentPattern = new RegExp(`(${escapeRegExp(prefix)}[A-Z0-9_]+)=(.*)$`);

  input.split(/\r?\n/).forEach((line, index) => {
    const match = line.match(assignmentPattern);

    if (!match) {
      return;
    }

    const [, name, rawValue] = match;
    const duplicate = byName.has(name);

    if (duplicate) {
      duplicatedNames.add(name);
    }

    byName.set(name, {
      name,
      value: rawValue.trim(),
      raw: `${name}=${rawValue.trim()}`,
      line: index + 1,
      duplicate,
    });
  });

  const variables = Array.from(byName.values());

  return {
    variables,
    duplicates: Array.from(duplicatedNames),
    maskedValueNames: variables
      .filter((variable) => hasMaskedValue(variable.value))
      .map((variable) => variable.name),
  };
}

export function formatEnv(result: ExtractionResult): string {
  return result.variables.map((variable) => `${variable.name}=${variable.value}`).join("\n");
}
