const { snakeCase, pascalCase } = require( 'change-case' );

function capitalize( text: string ): string {
  return text.charAt( 0 ).toUpperCase() + text.slice( 1 );
}

function uncapitalize( text: string ): string {
  return text.charAt( 0 ).toLowerCase() + text.slice( 1 );
}

function slugify( text: string ): string {
  return snakeCase( text ).replace( /_/g, '-' );
}

function componentCase( text: string ): string {
  return capitalize( pascalCase( text ) );
}

function generateRandomNumberString(): string {
  return Math.ceil( Math.random() * 1000000 ).toString();
}

export {
  capitalize,
  uncapitalize,
  slugify,
  componentCase,
  generateRandomNumberString,
};
