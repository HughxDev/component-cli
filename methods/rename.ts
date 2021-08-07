import * as fs from 'fs';
import { replaceInFile as replace } from 'replace-in-file';
import path = require( 'path' );

import { ReplaceOptions } from '../interfaces';
import addComponent from './add';
import { componentDirectory, getFileGlobs } from '../settings';
import { slugify, componentCase } from '../strings';

function renameComponent( verboseMode: boolean ) {
  const existingComponentId: string = process.argv.slice( 3 )[0];
  const newComponentId: string = process.argv.slice( 4 )[0];

  let existingBlockComponentName: string;
  let existingElementComponentShortName: string;
  let existingElementComponentName: string;

  let existingComponentNameRegex: RegExp;
  let existingClassNameRegex: RegExp;

  let newBlockComponentName: string;
  let newElementComponentShortName: string;
  let newElementComponentName: string;

  let newComponentClassName: string;

  let sourceDirectory: string;
  let targetDirectoryBase: string;
  let targetDirectory: string;

  let isSubcomponent: boolean;

  // Existing component is block-level:
  if ( existingComponentId.indexOf( '/' ) === -1 ) {
    isSubcomponent = false;

    // Naming:
    existingBlockComponentName = componentCase( existingComponentId );

    // Path:
    sourceDirectory = `${componentDirectory}/${existingBlockComponentName}`;
    existingComponentNameRegex = new RegExp( `${existingBlockComponentName}`, 'g' );
    existingClassNameRegex = new RegExp( `${slugify( existingBlockComponentName )}`, 'g' );

    // Existing component is element-level (subcomponent):
  } else {
    isSubcomponent = true;

    // Naming:
    const existingComponentIdParts = existingComponentId.split( '/' );
    existingBlockComponentName = componentCase( existingComponentIdParts[0] );
    existingElementComponentShortName = componentCase( existingComponentIdParts[1] );
    existingElementComponentName = `${existingBlockComponentName}${existingElementComponentShortName}`;

    // Path:
    sourceDirectory = `${componentDirectory}/${existingBlockComponentName}/_${existingElementComponentName}`;
    existingComponentNameRegex = new RegExp( `${existingElementComponentName}`, 'g' );
    existingClassNameRegex = new RegExp( `${slugify( existingBlockComponentName )}__${slugify( existingElementComponentShortName )}`, 'g' );
  }

  const existingComponentName = existingElementComponentName || existingBlockComponentName;

  // New component name is block-level:
  if ( newComponentId.indexOf( '/' ) === -1 ) {
    isSubcomponent = false;

    // Naming:
    newBlockComponentName = componentCase( newComponentId );

    // Path:
    targetDirectoryBase = `${componentDirectory}/${newBlockComponentName}`;
    targetDirectory = targetDirectoryBase;
    newComponentClassName = slugify( newBlockComponentName );

    // New component name is element-level (subcomponent):
  } else {
    isSubcomponent = true;

    // Naming:
    const newComponentIdParts = newComponentId.split( '/' );
    newBlockComponentName = componentCase( newComponentIdParts[0] );
    newElementComponentShortName = componentCase( newComponentIdParts[1] );
    newElementComponentName = `${newBlockComponentName}${newElementComponentShortName}`;

    // Path:
    targetDirectoryBase = `${componentDirectory}/${newBlockComponentName}`;
    targetDirectory = `${targetDirectoryBase}/_${newElementComponentName}`;
    newComponentClassName = `${slugify( newBlockComponentName )}__${slugify( newElementComponentShortName )}`;
  }

  const newComponentName = newElementComponentName || newBlockComponentName;
  const replaceOptions: ReplaceOptions = {
    "files": getFileGlobs( sourceDirectory ),
    "from": [existingComponentNameRegex, existingClassNameRegex],
    "to": [newComponentName, newComponentClassName],
    "allowEmptyPaths": true,
  };
  const successMessage = `Component renamed: ${existingComponentId} → ${newComponentId} @ ${targetDirectory}/`
    + `\nReferences to ${existingBlockComponentName} in other files must be replaced manually.`;

  return replace( replaceOptions )
    .then( () => {
      if ( !fs.existsSync( targetDirectoryBase ) && isSubcomponent ) {
        return addComponent( newBlockComponentName );
      }

      return true;
    } )
    .then(
      () => new Promise( ( resolve, reject ) => {
        const _renameDebug = `\nfs.rename(
  sourceDirectory = "${sourceDirectory}",
  targetDirectory = "${targetDirectory}"
)`;
        if ( verboseMode ) {
          console.log( _renameDebug );
        }

        fs.rename( sourceDirectory, targetDirectory, ( renameDirError ) => {
          if ( renameDirError ) {
            console.error( `${_renameDebug} failed:` );
            reject( renameDirError );
          }

          const _readdirDebug = `\nfs.readdir( targetDirectory = "${targetDirectory}" )`;
          if ( verboseMode ) {
            console.log( _readdirDebug );
          }

          fs.readdir( targetDirectory, ( dirError, files ) => {
            if ( dirError ) {
              console.error( `\nfs.readdir failed:` );
              reject( dirError );
            }

            files.forEach( ( file ) => {
              const newFile = file.replace( existingComponentName, newComponentName );
              const existingFilePath = path.join( targetDirectory, file );
              const newFilePath = path.join( targetDirectory, newFile );

              if ( fs.lstatSync( existingFilePath ).isDirectory() ) {
                fs.readdirSync( existingFilePath ).forEach( ( subdirectoryFile ) => {
                  fs.renameSync(
                    path.join( existingFilePath, subdirectoryFile ),
                    path.join( existingFilePath, subdirectoryFile.replace( existingComponentName, newComponentName ) ),
                  );
                } );
              }

              if ( verboseMode ) {
                console.log( '\nfile', file );
              }

              const _rename2Debug = `  fs.rename(
    existingFilePath = "${existingFilePath}",
    newFilePath = "${newFilePath}"
  )`;
              if ( verboseMode ) {
                console.log( _rename2Debug );
              }

              fs.rename( existingFilePath, newFilePath, ( renameError ) => {
                console.log( 'rename callback' );

                if ( renameError ) {
                  console.error( `${_rename2Debug} failed:` );
                  reject( renameError );
                }
              } );
            } ); // files.forEach

            resolve( successMessage );
          } ); // fs.readdir
        } ); // fs.rename
      } ),
    ); // then
}

export default renameComponent;
