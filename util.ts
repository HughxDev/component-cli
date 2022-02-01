import * as fs from 'fs';

interface TemplateVariableDefinition {
  name: string,
  description: string,
  output: {
    root: string,
    sub: string,
  }
}

type TemplateVariableDefinitions = TemplateVariableDefinition[];

export const templateVariableDefinitions: TemplateVariableDefinitions = [
  {
    "name": '#Component#',
    "description": 'Pascal Case, leading underscore for subcomponents',
    "output": {
      "root": 'Widget',
      "sub": '_WidgetSubwidget',
    },
  },
  {
    "name": '#COMPONENT#',
    "description": 'Constant Case, leading underscore for subcomponents',
    "output": {
      "root": 'WIDGET',
      "sub": '_WIDGET_SUBWIDGET',
    },
  },
  {
    "name": "#ComponentBare#",
    "description": "Pascal Case, no leading underscore for subcomponents",
    "output": {
      "root": "Widget",
      "sub": "WidgetSubwidget",
    },
  },
  {
    "name": "#COMPONENT_BARE#",
    "description": "Constant Case, no leading underscore for subcomponents",
    "output": {
      "root": "WIDGET",
      "sub": "WIDGET_SUBWIDGET",
    },
  },
  {
    "name": "#ComponentShort#",
    "description": "Pascal Case, no parent prefix for subcomponents",
    "output": {
      "root": "Widget",
      "sub": "Subwidget",
    },
  },
  {
    "name": "#COMPONENT_SHORT#",
    "description": "Constant Case, no parent prefix for subcomponents",
    "output": {
      "root": "WIDGET",
      "sub": "SUBWIDGET",
    },
  },
  {
    "name": "#component#",
    "description": "BEM Case, subcomponent as element relative to parent",
    "output": {
      "root": "widget",
      "sub": "widget__subwidget",
    },
  },
  {
    "name": "#component:block#",
    "description": "BEM Case, subcomponent as new block",
    "output": {
      "root": "widget",
      "sub": "widget-subwidget",
    },
  },
];

const _directoryStructure: Record<string, string> = {};
const templatePath = './_templates/components/#Component#';
const templateFiles = fs.readdirSync( templatePath, 'utf8' );

templateFiles.forEach( ( templateFile ) => {
  const fullPath = `${templatePath}/${templateFile}`;

  // TODO: Recursion
  if ( fs.lstatSync( fullPath ).isFile() ) {
    _directoryStructure[fullPath] = fs.readFileSync( fullPath, 'utf8' );
  }
} );

export const directoryStructure = _directoryStructure;