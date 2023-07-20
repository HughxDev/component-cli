import { ReplaceInFileConfig } from "replace-in-file";

export interface ReplaceOptions extends Omit<ReplaceInFileConfig, 'files' | 'from' | 'to'> {
  files: string[];
  from: RegExp[];
  to: string[];
}
