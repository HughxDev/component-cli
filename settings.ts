export const defaultTemplateDirectory: string = '_templates/components';
export const defaultComponentDirectory: string = 'src/components';

export function getFileGlobs( directory: string = '.' ): Array<string> {
  return [
    `${directory}/**/*.js`,
    `${directory}/**/*.json`,
    `${directory}/**/*.jsx`,
    `${directory}/**/*.ts`,
    `${directory}/**/*.tsx`,
    `${directory}/**/*.css`,
    `${directory}/**/*.scss`,
    `${directory}/**/*.sass`,
    `${directory}/**/*.less`,
    `${directory}/**/*.styl`,
    `${directory}/**/*.graphql`,
    `${directory}/**/*.gql`,
  ];
}

export function getConfig( verbose: boolean = false ) {
  let config = {
    "templateDirectory": defaultTemplateDirectory,
    "componentDirectory": defaultComponentDirectory,
  };

  try {
    config = require( `${process.cwd()}/.component-cli.js` );

    if ( verbose ) {
      console.log( `Project-level config found @ ${process.cwd()}/.component-cli.js:` );
      console.log( `${JSON.stringify( config, null, 2 )}\n` );
    }
  } catch ( missingConfigError ) {
    if ( verbose ) {
      console.log( `Project-level config not found @ ${process.cwd()}/.component-cli.js.\n` );
    }
  }

  return config;
}