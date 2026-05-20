import { TextRenderable as OpenTuiText } from "@opentui/core";

export type TextRenderable = OpenTuiText;

export function setContent(renderable: TextRenderable, content: string): void {
  (renderable as unknown as { content: string }).content = content;
}
