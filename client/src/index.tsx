import * as React from 'react';

import { createRoot } from 'react-dom/client';

import { isIE } from 'react-device-detect';
import { BrowserRouter } from 'react-router-dom';
import './index.scss';
import { App } from './pages';

if (isIE)
  alert(
    'Internet Explorer is no longer supported by Microsoft. Please consider updating to Edge or another current browser to avoid functionality issues'
  );

// TODO: Disabled until they push a patch, it currently crashes with the polyfill
// Accessibility testing in development
// if (process.env.NODE_ENV !== 'production') {
//   axe(React, ReactDOM, 1000).then((r) => r);
// }

// Make sure to change the baseName variable in the package.json file to match the homepage, but omit the /
const baseName =
  process.env.REACT_APP_BASE_NAME !== undefined ? `/${process.env.REACT_APP_BASE_NAME}` : '/';

// Moved <ServiceWorkerWrapper /> to lower level
// for push subscription in user

/*

//REACT 17
ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter basename={baseName}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

*/

// After
const container = document.getElementById('root');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(
  <React.StrictMode>
    <BrowserRouter basename={baseName}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
