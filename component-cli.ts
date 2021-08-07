#!/usr/bin/env node

import addComponent from './methods/add';
import renameComponent from './methods/rename';
import removeComponent from './methods/remove';

const verboseMode = ( process.argv.indexOf( '--verbose' ) !== -1 );
const action = process.argv.slice( 2 )[0];
const componentName = process.argv.slice( 3 )[0];

switch ( action ) {
  case 'add':
  case 'create':
  case 'new':
    addComponent( componentName )
      .then( ( successMessage: string ) => {
        console.log( successMessage );
        process.exit( 0 );
      } )
      .catch( ( error: string ) => {
        console.error( error );
        process.exit( 1 );
      } );
    break;

  case 'rename':
  case 'rn':
  case 'mv':
  case 'move':
    renameComponent( verboseMode )
      .then( ( successMessage ) => {
        console.log( successMessage );
        process.exit( 0 );
      } )
      .catch( ( error ) => {
        console.error( error );
        process.exit( 1 );
      } );
    break;

  case 'delete':
  case 'del':
  case 'destroy':
  case 'remove':
  case 'rm':
    removeComponent()
      .then( ( successMessage ) => {
        console.log( successMessage );
        process.exit( 0 );
      } )
      .catch( ( error ) => {
        console.error( error );
        process.exit( 1 );
      } );
    break;

  default:
    console.error( `Unrecognized action: ${action}` );
}
