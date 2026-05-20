export type DashboardAction = "copy" | "save" | "path" | "force" | "replace" | "quit";
export type DashboardResult = "quit" | "replace" | "path";

export type DashboardState = {
  outputPath: string;
  force: boolean;
};
