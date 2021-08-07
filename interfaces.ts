import { ReplaceInFileConfig } from "replace-in-file";

export interface ReplaceOptions extends ReplaceInFileConfig {
  files: Array<string>;
  from: Array<RegExp>;
  to: Array<string> | undefined;
}
