import React from 'react';
import PropTypes from 'prop-types';

// import {} from './methods.js'

import './#Component#.scss';

function $Component$( props ) {
  return (
    <div data-testid="my-#component#" className={ `my-#component#${props.className ? ` ${props.className}` : ''}` }>
      { props.children }
    </div>
  );
}

$Component$.displayName = '#Component#';

export default $Component$;
