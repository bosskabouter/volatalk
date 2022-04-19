import ServiceWorkerWrapper from 'components/ServiceWorkerWrapper';
import { App } from 'pages';
import * as React from 'react';
import { isIE } from 'react-device-detect';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import './index.scss';

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

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter basename={baseName}>
      <ServiceWorkerWrapper />
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);