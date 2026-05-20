export type Options = {
  prefix: string;
  copy: boolean;
  output?: string;
  force: boolean;
};

export function parseArgs(argv: string[]): Options {
  const options: Options = {
    prefix: "NEXT_PUBLIC_",
    copy: false,
    force: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--copy" || arg === "-c") {
      options.copy = true;
      continue;
    }

    if (arg === "--force" || arg === "-f") {
      options.force = true;
      continue;
    }

    if (arg === "--prefix" || arg === "-p") {
      options.prefix = argv[index + 1] ?? options.prefix;
      index += 1;
      continue;
    }

    if (arg === "--output" || arg === "-o") {
      options.output = argv[index + 1];
      index += 1;
      continue;
    }
  }

  return options;
}
