import React from 'react';

import './#Component#.scss';

export interface $ComponentBare$Props {
  // Uncomment this if your component requires children
  // children: ReactNode;
  className?: string;
}

export const $Component$ = ( props: $ComponentBare$Props ) => {
  const { className } = props;

  return (
    <ul
      data-testid="my-#component#"
      className={ `my-#component:block#${className ? ` ${className}` : ''}` }
    >
      <li>#{''}Component{''}#: #Component#</li>
      <li>#{''}COMPONENT{''}#: #COMPONENT#</li>
      <li>#{''}ComponentBare{''}#: #ComponentBare#</li>
      <li>#{''}COMPONENT_BARE{''}#: #COMPONENT_BARE#</li>
      <li>#{''}ComponentShort{''}#: #ComponentShort#</li>
      <li>#{''}COMPONENT_SHORT{''}#: #COMPONENT_SHORT#</li>
      <li>#{''}component{''}#: #component#</li>
      <li>#{''}component:block{''}#: #component:block#</li>
    </ul>
  );
};

$Component$.displayName = '#Component#';
