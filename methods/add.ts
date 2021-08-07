import * as fs from 'fs';
import { replaceInFile as replace } from 'replace-in-file';
import path = require( 'path' );
import mkdirp = require( 'mkdirp' );
import { ncp } from 'ncp';

import { ReplaceOptions } from '../interfaces';
import { templateDirectory, componentDirectory, getFileGlobs } from '../settings';
import { slugify, componentCase } from '../strings';

// @ts-ignore Missing in declaration file
ncp.limit = 16;

function addComponent(
  componentName: string,
  subcomponentName: string = '',
  recursionLevel: number = 1,
): Promise<void | string | boolean> {
  let subcomponentFullName: string;

  // If we have an element-level component i.e. `Component/Subcomponent`:
  if ( subcomponentName ) {
    subcomponentFullName = `_${componentName}${subcomponentName}`;
  } else {
    if ( componentName.indexOf( '/' ) !== -1 ) {
      const componentNameParts = componentName.split( '/' );
      componentName = componentCase( componentNameParts[0] );
      subcomponentName = componentCase( componentNameParts[1] );
      subcomponentFullName = `_${componentName}${subcomponentName}`;
    } else {
      componentName = componentCase( componentName );
      subcomponentFullName = `_${subcomponentName}`;
    }
  }

  const hasSubcomponent = recursionLevel === 1 && subcomponentName.length > 0;
  const isSubcomponent = recursionLevel > 1 && subcomponentName.length > 0;

  const targetDirectoryBase = `${componentDirectory}/${componentName}`;
  let targetDirectory: string;

  if ( isSubcomponent ) {
    targetDirectory = `${targetDirectoryBase}/${subcomponentFullName}`;
  } else {
    targetDirectory = targetDirectoryBase;
  }

  const replaceOptions: ReplaceOptions = {
    "files": getFileGlobs( targetDirectory ),
    "from": [
      /([#$])Component\1/g,
      /(\\?[#$])component\1/g,
    ],
    "to": undefined,
    "allowEmptyPaths": true,
  };
  if ( isSubcomponent ) {
    replaceOptions.to = [subcomponentFullName, `${slugify( componentName )}__${slugify( subcomponentName )}`];
  } else {
    replaceOptions.to = [componentName, `${slugify( componentName )}`];
  }

  // let targetDirectoryBaseExists;
  let targetDirectoryExists: Boolean;

  // try {
  //   fs.statSync( targetDirectoryBase );
  //   targetDirectoryBaseExists = true;
  // } catch ( error ) {
  //   targetDirectoryBaseExists = false;
  // }

  try {
    fs.statSync( targetDirectory );
    targetDirectoryExists = true;
  } catch ( error ) {
    targetDirectoryExists = false;
  }

  return Promise.resolve()
    .then( () => {
      // eslint-disable-line consistent-return
      if ( targetDirectoryExists && recursionLevel === 1 ) {
        if ( hasSubcomponent ) {
          return addComponent( componentName, subcomponentName, 2 );
        }

        throw new Error( `Component already exists: ${componentName} @ ${targetDirectory}/` );
      }

      return null;
    } )
    .then(
      ( result ) => new Promise( ( resolve, reject ) => {
        if ( !targetDirectoryExists ) {
          mkdirp.sync( targetDirectory );
          ncp(
            // Source
            `${templateDirectory}/#Component#`,

            // Destination
            targetDirectory,

            // Options
            {
              "clobber": false,
              // @ts-ignore Missing in declaration file
              "rename": function rename( target: string ) {
                const pathInfo = path.parse( target );
                const filename = pathInfo.base.replace( replaceOptions.from[0], replaceOptions.to[0] );
                const resolution = path.resolve( targetDirectory, filename );

                return resolution;
              },
            },

            // Callback
            ( ncpError: string ) => {
              if ( ncpError ) {
                // rimraf.sync( targetDirectory );
                console.error( `ncp failed:` );
                reject( ncpError );
              }

              const successMessage = `Component created: ${isSubcomponent || hasSubcomponent ? subcomponentFullName : componentName} @ ${targetDirectory}/`;

              replace( replaceOptions )
                .then( () => {
                  if ( hasSubcomponent ) {
                    return addComponent( componentName, subcomponentName, 2 );
                  }

                  return true;
                } )
                .then( () => {
                  resolve( successMessage );
                } )
                .catch( ( replacementError ) => {
                  console.error( `replace-in-file failed:` );
                  reject( replacementError );
                } );
            }, // ncp callback
          ); // ncp
        } else {
          resolve( result );
        }
      } ),
    ); // then // return
}

export default addComponent;
