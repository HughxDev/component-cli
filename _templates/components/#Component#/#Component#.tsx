import React from 'react';

import './#Component#.scss';

export interface $ComponentBare$Props {
  // Uncomment this if your component requires children
  // children: ReactNode;

  className?: string;
}

export const $Component$ = ( props: $ComponentBare$Props ) => (
  <div data-testid="my-#component#" className={ `my-#component:block#${props.className ? ` ${props.className}` : ''}` }>
    { /* Implement me */ }
  </div>
);

$Component$.displayName = '#Component#';
