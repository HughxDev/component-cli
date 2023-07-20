import rimraf = require( 'rimraf' );

import { componentCase } from '../strings';
import { getConfig } from '../settings';

const { componentDirectory } = getConfig();

function removeComponent() {
  const componentId = process.argv.slice( 3 )[0];
  let componentName;
  let subcomponentFullName;
  let targetDirectory: string;
  let isSubcomponent = false;

  // Block-level component:
  if ( componentId.indexOf( '/' ) === -1 ) {
    componentName = componentCase( componentId );
    targetDirectory = `${componentDirectory}/${componentName}`;
    // Element-level component:
  } else {
    isSubcomponent = true;
    const componentIdParts = componentId.split( '/' );
    componentName = componentCase( componentIdParts[0] );
    const subcomponentName = componentCase( componentIdParts[1] );
    subcomponentFullName = `${componentName}${subcomponentName}`;
    targetDirectory = `${componentDirectory}/${componentName}/_${subcomponentFullName}`;
  }

  const componentOrSubcomponentFullName = isSubcomponent ? subcomponentFullName : componentName;

  return new Promise( ( resolve, reject ) => {
    rimraf.sync( targetDirectory );

    rimraf( targetDirectory, ( deletionError ) => {
      if ( deletionError ) {
        console.error( `rimraf failed:` );
        reject( deletionError );
      }

      resolve(
        `Component deleted: ${componentOrSubcomponentFullName}`
        + `\nReferences to ${componentOrSubcomponentFullName} in other files must be removed manually.`,
      );
    } );
  } );
}

export default removeComponent;
