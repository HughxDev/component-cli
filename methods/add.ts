import * as fs from 'fs';
import { replaceInFile as replace } from 'replace-in-file';
import path = require( 'path' );
import mkdirp = require( 'mkdirp' );
import copy from 'recursive-copy';

import { ReplaceOptions } from '../interfaces';
import { templateDirectory, componentDirectory, getFileGlobs } from '../settings';
import { slugify, componentCase, constantCase } from '../strings';

function addComponent(
  componentName: string,
  subcomponentName: string = '',
  recursionLevel: number = 1,
): Promise<void | string | boolean> {
  let subcomponentBareName: string;
  let subcomponentFullName: string;

  // If we have an element-level component i.e. `Component/Subcomponent`:
  if ( subcomponentName ) {
    subcomponentBareName = `${componentName}${subcomponentName}`;
    subcomponentFullName = `_${subcomponentBareName}`;
  } else {
    if ( componentName.indexOf( '/' ) !== -1 ) {
      const componentNameParts = componentName.split( '/' );
      componentName = componentCase( componentNameParts[0] );
      subcomponentName = componentCase( componentNameParts[1] );
      subcomponentBareName = `${componentName}${subcomponentName}`;
      subcomponentFullName = `_${subcomponentBareName}`;
    } else {
      componentName = componentCase( componentName );
      subcomponentBareName = subcomponentName;
      subcomponentFullName = `_${subcomponentBareName}`;
    }
  }

  const componentClassName = slugify( componentName );
  const subcomponentClassName = slugify( subcomponentName );

  const componentConstantName = constantCase( componentName );
  const subcomponentConstantName = constantCase( subcomponentName );
  const subcomponentFullConstantName = `_${constantCase( subcomponentFullName )}`;
  const subcomponentBareConstantName = constantCase( subcomponentBareName );

  const subcomponentFullClassName = `${componentClassName}__${subcomponentClassName}`;
  const subcomponentNewBlockClassName = `${componentClassName}-${subcomponentClassName}`;

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
      /([#$])Component\1/g, // #Component# → Widget, _WidgetSubwidget
      /([#$])COMPONENT\1/g, // #COMPONENT# → WIDGET, _WIDGET_SUBWIDGET
      /([#$])ComponentBare\1/g, // #ComponentBare# → Widget, WidgetSubwidget
      /([#$])COMPONENT_BARE\1/g, // #COMPONENT_BARE# → WIDGET, WIDGET_SUBWIDGET
      /([#$])ComponentShort\1/g, // #ComponentShort# → Widget, Subwidget
      /([#$])COMPONENT_SHORT\1/g, // #COMPONENT_SHORT# → WIDGET, SUBWIDGET
      /(\\?[#$])component\1/g, // #component# → widget, widget__subwidget
      /(\\?[#$])component:block\1/g, // #component:block# → widget, widget-subwidget
    ],
    "to": undefined,
    "allowEmptyPaths": true,
  };
  if ( isSubcomponent ) {
    replaceOptions.to = [
      subcomponentFullName, // #Component#
      subcomponentFullConstantName, // #COMPONENT#
      subcomponentBareName, // #ComponentBare#
      subcomponentBareConstantName,
      subcomponentName, // #ComponentShort#
      subcomponentConstantName, // #COMPONENT_SHORT#
      subcomponentFullClassName, // #component#
      subcomponentNewBlockClassName, // #component:block#
    ];
  } else {
    replaceOptions.to = [
      componentName, // #Component#
      componentConstantName, // #COMPONENT#
      componentName, // #ComponentBare#
      componentConstantName, // #COMPONENT_BARE#
      componentName, // #ComponentShort#
      componentConstantName, // #COMPONENT_SHORT#
      componentClassName, // #component#
      componentClassName, // #component:block#
    ];
  }

  if ( replaceOptions.from.length !== replaceOptions.to.length ) {
    console.error( `replaceOptions.from and replaceOptions.to must match in length.` );
    process.exit( 1 );
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
          copy(
            // Source
            `${templateDirectory}/#Component#`,

            // Destination
            targetDirectory,

            // Options
            {
              "overwrite": false,
              "rename": function rename( target ) {
                const pathInfo = path.parse( target );
                let filename = pathInfo.base;

                for ( let index = 0; index < replaceOptions.from.length; index++ ) {
                  const from = replaceOptions.from[index];
                  const to = replaceOptions.to[index];

                  filename = filename.replace( from, to );
                }

                const resolution = `${pathInfo.dir}/${filename}`;

                return resolution;
              },
            },
          )
            .then( () => {
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
            } ) // recursive-copy callback
            .catch( ( recursiveCopyError: string ) => {
              if ( recursiveCopyError ) {
                // rimraf.sync( targetDirectory );
                console.error( `recursive-copy failed:` );
                reject( recursiveCopyError );
              }
            } ); // recursive-copy
        } else {
          resolve( result );
        }
      } ),
    ); // then // return
}

export default addComponent;
