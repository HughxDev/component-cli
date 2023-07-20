import type { Config } from '@jest/types';

export default async (): Promise<Config.InitialOptions> => {
  return {
    "testPathIgnorePatterns": [
      "_templates/",
      "src/",
    ],
  };
};
