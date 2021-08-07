export const templateDirectory: string = '_templates/components';
export const componentDirectory: string = 'src/components';

export function getFileGlobs( directory: string = '.' ): Array<string> {
  return [
    `${directory}/**/*.js`,
    `${directory}/**/*.jsx`,
    `${directory}/**/*.ts`,
    `${directory}/**/*.tsx`,
    `${directory}/**/*.scss`,
    `${directory}/**/*.sass`,
    `${directory}/**/*.less`,
    `${directory}/**/*.styl`,
  ];
}
