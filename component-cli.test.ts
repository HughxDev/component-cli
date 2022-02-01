import { IFs, vol } from 'memfs';
import * as _fs from 'fs/promises';
import { templateVariableDefinitions, directoryStructure } from './util';
import addComponent from './methods/add';
import removeComponent from 'methods/remove';
import renameComponent from 'methods/rename';

jest.doMock( 'fs' );
jest.doMock( 'fs/promises' );

/**
 * Transforms into array of arrays for consumption by `it.each()`, e.g.
 * 
 * [
 *   ['#Component#', 'Pascal Case, leading underscore for subcomponents', 'Widget', '_WidgetSubwidget'],
 *   ['#COMPONENT#', 'Constant Case, leading underscore for subcomponents', 'WIDGET', '_WIDGET_SUBWIDGET'],
 * ]
 */
const templateVariableTestParameters = templateVariableDefinitions.map(
  ( definition ) => Object.values( definition ).map(
    ( value ) => typeof value === 'string' ? value : Object.values( value ),
  ).flat(),
);

const root = 'Widget';
const sub = 'Subwidget';
const fs = _fs as unknown as IFs['promises'];

describe( 'Component CLI', () => {
  // beforeAll( () => {
  //   vol.fromJSON( directoryStructure );
  // } );

  describe( 'Add', () => {
    it( 'Creates a new component at the root level', async () => {
      await addComponent( root );
      const lstat = await fs.lstat( './src/components/Widget' );

      expect( lstat.isDirectory() ).toBe( true );
    } );

    it.todo( 'Creates a new subcomponent' );

    it.todo( 'Throws an error if attempting to create a nested subcomponent' );

    describe( 'Variables', () => {
      // it( 'Mock file', async () => {
      //   const filePath = '/file.txt';
      //   let writeResult;
      //   let readResult;

      //   try {
      //     writeResult = await ( fs as unknown as IFs['promises'] ).writeFile( filePath, 'hello Test' );
      //   } catch ( error ) {
      //     console.error( 'write error', error );
      //   }

      //   console.log( 'writeResult', writeResult );

      //   try {
      //     readResult = await ( fs as unknown as IFs['promises'] ).readFile( filePath, 'utf8' );
      //   } catch ( error ) {
      //     console.error( 'read error' );
      //   }

      //   console.log( 'readResult', readResult );
      // } );

      // it.each( templateVariableTestParameters )( '%s (%s)', ( name, description, rootOutput, subOutput ) => {
      //   console.log( 'name', name );
      //   console.log( 'description', description );
      //   console.log( 'rootOutput', rootOutput );
      //   console.log( 'subOutput', subOutput );
      // } );
    } );
  } );

  describe( 'Remove', () => {
    it.todo( 'Deletes an existing component' );
  } );

  describe( 'Rename', () => {
    it.todo( 'Renames a root-level component to a root-level component' );

    it.todo( 'Renames and moves a root-level component to a subcomponent' );

    it.todo( 'Renames a subcomponent to a subcomponent with the same parent' );

    it.todo( 'Renames a subcomponent to a subcomponent with a different parent' );

    it.todo( 'Renames a subcomponent to a root-level component' );
  } );
} );