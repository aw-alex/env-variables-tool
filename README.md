# 🔡 env-variables-tool

A CLI tool to extract `NEXT_PUBLIC_*` environment variables from raw terminal logs.

Paste raw text into an interactive TUI, preview the extracted variables, then copy them to your clipboard or save them as a `.env` file.

## ✨ Features

- 🔎 Extracts `NEXT_PUBLIC_*` variables from noisy raw logs
- 🖥️ Interactive terminal UI with preview
- 📋 Copy output to clipboard
- 💾 Save output to `.env`
- 🏷️ Supports custom prefixes
- 🔌 Works with piped input
- 🔐 Does not cache or persist raw values unless you explicitly save them


Built on:

🖥️ [`@opentui/core`](https://opentui.com) for the terminal UI

📋 [`clipboardy`](https://www.npmjs.com/package/clipboardy) for clipboard access

## 📦 Requirements

- 🥟 **[Bun](https://bun.sh)** ≥ 1.3 — OpenTUI is Bun-exclusive.

If you need to install Bun with Homebrew:

```sh
brew tap oven-sh/bun
brew install bun
```

## 🛠️ Local Installation

Clone the repository:

```sh
git clone https://github.com/aw-alex/env-variables-tool.git
cd env-variables-tool
```

Install dependencies:

```sh
bun install
```

Run locally:

```sh
bun run start
```

Or link it globally from your local clone:

```sh
bun link
envariables
```

## 🌎 Install globally (run command `envariables` from anywhere)

Install directly from GitHub:

```sh
bun install -g git+https://github.com/aw-alex/env-variables-tool.git
```

Then run:

```sh
envariables
```

If Bun warns that the global bin folder is not in your `PATH`, run:

```sh
echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Verify:

```sh
which envariables
```

## 🗑️ Remove

If installed globally from GitHub:

```sh
bun remove -g env-variables-tool
```

If linked globally from a local clone:

```sh
cd env-variables-tool
bun unlink
```

## 🚀 Usage

Open the interactive UI:

```sh
envariables
```

## 🎛️ TUI Controls

| Key | Action |
| --- | --- |
| `Ctrl+D` | Finish raw input and open preview |
| `↑` / `↓` | Move through actions |
| `Enter` | Run selected action |
| `1` / `c` | Copy to clipboard |
| `2` / `s` | Save `.env` file |
| `3` / `o` | Change output path |
| `4` / `f` | Toggle overwrite |
| `5` / `e` | Paste new raw text |
| `q` | Quit |

## 🧪 Example

Raw input:

```txt
2026-05-11T16:14:07.5976051Z NEXT_PUBLIC_USE_FLAG=false
2026-05-11T16:14:07.5976327Z NEXT_PUBLIC_USE_FEATURE=true
2026-05-11T16:14:07.5976620Z NEXT_PUBLIC_FOO_ENABLE=true
```

Extracted output:

```env
NEXT_PUBLIC_USE_FLAG=false
NEXT_PUBLIC_USE_FEATURE=true
NEXT_PUBLIC_FOO_ENABLE=true
```

## 🔄 Updating

If installed globally from GitHub:

```sh
bun install -g git+https://github.com/aw-alex/env-variables-tool.git
```

If installed locally with `git clone`:

```sh
cd env-variables-tool
git pull
bun install
bun link
```

## 🔐 Security

Raw values are not cached, logged, or stored by the tool.

Values only live in memory while the process is running, unless you explicitly copy them to the clipboard or save them to a file.
