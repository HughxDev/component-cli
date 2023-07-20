import * as fs from 'fs';
import { replaceInFile, ReplaceInFileConfig } from 'replace-in-file';
import path = require( 'path' );

import addComponent from './add';
import { getConfig, getFileGlobs } from '../settings';
import { slugify, componentCase, constantCase } from '../strings';

function renameComponent( verboseMode: boolean ) {
  const { componentDirectory } = getConfig( verboseMode );

  const existingComponentId: string = process.argv.slice( 3 )[0];
  const newComponentId: string = process.argv.slice( 4 )[0];

  let existingBlockComponentName: string;
  let existingElementComponentShortName: string;
  let existingElementComponentName: string | undefined;

  let existingComponentNameRegex: RegExp;
  let existingComponentShortNameRegex: RegExp;
  let existingClassNameRegex: RegExp;
  let existingComponentConstantNameRegex: RegExp;
  let existingComponentConstantShortNameRegex: RegExp;

  let newBlockComponentName: string;
  let newElementComponentShortName: string;
  let newElementComponentName: string | undefined;

  let newComponentShortName: string;
  let newComponentClassName: string;
  let newComponentConstantName: string;
  let newComponentConstantShortName: string;

  let sourceDirectory: string;
  let targetDirectoryBase: string;
  let targetDirectory: string;

  let isSubcomponent: boolean;

  // Existing component is block-level:
  if ( existingComponentId.indexOf( '/' ) === -1 ) {
    isSubcomponent = false;

    // Naming:
    existingBlockComponentName = componentCase( existingComponentId );
    existingComponentNameRegex = new RegExp( `${existingBlockComponentName}`, 'g' );
    existingComponentShortNameRegex = existingComponentNameRegex;
    existingClassNameRegex = new RegExp( `${slugify( existingBlockComponentName )}`, 'g' );
    existingComponentConstantNameRegex = new RegExp( constantCase( existingBlockComponentName ), 'g' );
    existingComponentConstantShortNameRegex = existingComponentConstantNameRegex;

    // Path:
    sourceDirectory = `${componentDirectory}/${existingBlockComponentName}`;

    // Existing component is element-level (subcomponent):
  } else {
    isSubcomponent = true;

    // Naming:
    const existingComponentIdParts = existingComponentId.split( '/' );
    existingBlockComponentName = componentCase( existingComponentIdParts[0] );
    existingElementComponentShortName = componentCase( existingComponentIdParts[1] );
    existingElementComponentName = `${existingBlockComponentName}${existingElementComponentShortName}`;
    existingComponentNameRegex = new RegExp( `${existingElementComponentName}`, 'g' );
    existingComponentShortNameRegex = new RegExp( `${existingElementComponentShortName}`, 'g' );
    existingClassNameRegex = new RegExp( `${slugify( existingBlockComponentName )}(__|-)${slugify( existingElementComponentShortName )}`, 'g' );
    existingComponentConstantNameRegex = new RegExp( `(_)?${constantCase( `${existingBlockComponentName}_${existingElementComponentShortName}` )}`, 'g' );
    existingComponentConstantShortNameRegex = new RegExp( constantCase( existingElementComponentShortName ), 'g' );

    // Path:
    sourceDirectory = `${componentDirectory}/${existingBlockComponentName}/_${existingElementComponentName}`;
  }

  const existingComponentName = existingElementComponentName || existingBlockComponentName;

  // New component name is block-level:
  if ( newComponentId.indexOf( '/' ) === -1 ) {
    isSubcomponent = false;

    // Naming:
    newBlockComponentName = componentCase( newComponentId );
    newComponentClassName = slugify( newBlockComponentName );
    newComponentShortName = newBlockComponentName;
    newComponentConstantName = constantCase( newBlockComponentName );
    newComponentConstantShortName = newComponentConstantName;

    // Path:
    targetDirectoryBase = `${componentDirectory}/${newBlockComponentName}`;
    targetDirectory = targetDirectoryBase;

    // New component name is element-level (subcomponent):
  } else {
    isSubcomponent = true;

    // Naming:
    const newComponentIdParts = newComponentId.split( '/' );
    newBlockComponentName = componentCase( newComponentIdParts[0] );
    newElementComponentShortName = componentCase( newComponentIdParts[1] );
    newElementComponentName = `${newBlockComponentName}${newElementComponentShortName}`;
    newComponentShortName = newElementComponentShortName;
    newComponentClassName = `${slugify( newBlockComponentName )}$1${slugify( newElementComponentShortName )}`;
    newComponentConstantName = `$1${constantCase( `${newBlockComponentName}_${newElementComponentShortName}` )}`;
    newComponentConstantShortName = constantCase( newElementComponentName );

    // Path:
    targetDirectoryBase = `${componentDirectory}/${newBlockComponentName}`;
    targetDirectory = `${targetDirectoryBase}/_${newElementComponentName}`;
  }

  const newComponentName = newElementComponentName || newBlockComponentName;
  const replacementWarnings = new Set();
  const replaceOptions: ReplaceInFileConfig = {
    "files": getFileGlobs( sourceDirectory ),
    "from": [
      // 1:
      existingComponentNameRegex,
      // 2:
      existingComponentShortNameRegex,
      // 3:
      existingClassNameRegex,
      // 4:
      existingComponentConstantNameRegex,
      // 5:
      existingComponentConstantShortNameRegex,
    ],
    // TODO: convert these to callbacks
    "to": [
      // 1:
      newComponentName,
      // 2:
      newComponentShortName,
      // 3:
      ( match ) => {
        if ( verboseMode ) {
          console.log( `\n---` );
          console.log( `\nclass rename: ${existingClassNameRegex} → ${newComponentClassName} (default) or fallback` );
          console.log( `\nmatch`, match );
        }

        /*
          If there is no dash or underscore, the first capture group for existingClassNameRegex won’t be filled.
          This catches that and makes sure the unmatched $1 doesn’t show up in the replacement string.
        */
        if ( ( match.indexOf( '-' ) === -1 ) && ( match.indexOf( '__' ) === -1 ) ) {
          const fallbackNewComponentClassName = newComponentClassName.replace( /\$1(?![0-9])/g, '-' );
          const alternativeNewComponentClassName = newComponentClassName.replace( /\$1(?![0-9])/g, '__' );

          if ( verboseMode ) {
            console.log( `❌ \`match\` had neither a hypen nor a double underscore; doing fallback replacement to ${fallbackNewComponentClassName}.` );
            console.log( `fallbackNewComponentClassName`, fallbackNewComponentClassName, `\n` );
          }

          replacementWarnings.add(
            `Encountered matching BEM-case string “${match}” that has a nondeterministic template variable mapping:`
            + ` could be #component# or #component:block#.`
            + ` As a result, #component:block# has been chosen as a fallback.`
            + ` If this is not what you want, please manually replace references to “${fallbackNewComponentClassName}” with “${alternativeNewComponentClassName}”.`,
          );

          return fallbackNewComponentClassName;
        }
        
        const defaultReplacement = match.replace( existingClassNameRegex, newComponentClassName );

        if ( verboseMode ) {
          console.log( `✅ match had either a hyphen or a double underscore; doing default replacement to ${defaultReplacement}.` );
        }

        return defaultReplacement;
      },
      // 4:
      ( match ) => {
        /*
          If there is no leading underscore, the first capture group for existingComponentConstantNameRegex won’t be filled.
          This catches that and makes sure the unmatched $1 doesn’t show up in the replacement string.
        */
        if ( match.indexOf( '_' ) !== 0 ) {
          const fallbackNewComponentConstantName = newComponentConstantName.replace( /^\$1(?![0-9])/, '' );
          const alternativeNewComponentConstantName = newComponentConstantName.replace( /^\$1(?![0-9])/, '_' );

          replacementWarnings.add(
            `Encountered matching Constant-case string “${match}” that has a nondeterministic template variable mapping:`
            + ` could be #COMPONENT# or #COMPONENT_BARE#.`
            + ` As a result, #COMPONENT_BARE# has been chosen as a fallback.`
            + ` If this is not what you want, please manually replace references to “${fallbackNewComponentConstantName}” with “${alternativeNewComponentConstantName}”.`,
          );

          return fallbackNewComponentConstantName;
        }

        return newComponentConstantName;
      },
      // 5:
      newComponentConstantShortName,
    ],
    "allowEmptyPaths": true,
  };

  if ( verboseMode ) {
    console.log( 'replaceOptions', replaceOptions );
  }

  let successMessage = `${verboseMode ? '\n' : ''}${`Component renamed: ${existingComponentId} → ${newComponentId} @ ${targetDirectory}/`
    + `\nReferences to ${existingComponentId} in other files must be replaced manually.`}`;

  return replaceInFile( replaceOptions )
    .then( () => {
      if ( !fs.existsSync( targetDirectoryBase ) && isSubcomponent ) {
        return addComponent( { "componentName": newBlockComponentName } );
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

            if ( replacementWarnings.size ) {
              successMessage += `\n\n${Array.from( replacementWarnings ).join( '\n\n' )}\n`;
            }

            resolve( successMessage );
          } ); // fs.readdir
        } ); // fs.rename
      } ),
    ); // then
}

export default renameComponent;
