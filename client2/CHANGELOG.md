## pwa-starter V2.1.0

- Migrated from MUIv4 to MUIv5
  - Started using emotion as our styling engine
- Migrated to React 17
- Migrated to React-router v6
- Migrated from HashRouter to BrowserRouter
- Stores user profile, encrypted, as a dexie database in a table

## pwa-starter V1.4.0

- Create React App Template added
  - Template process is automated through pipeline requiring no additional steps for developers making updates to PWA Starter
  - New projects can now be created from the PWA Starter using Create React App Template command
  - Further documentation about template added to Readme
- Splash screens have been updated
- Service worker has been updated and enabled by default
- EULA accepted status bug fix
- Removed .eslintcache
- Replaced tslint with eslint
- Added service worker support
  - Service worker registers by default
- Added PWA Compat
- Added a popup warning that the user is running Internet Explorer
- Changed “redux” folder to “store”
- Changed “containers” to “pages”
- Changed node image in the pipeline from 12 to 14
- Added Redux-Persist
- Added Lazy Loading and Suspense
- Added Axe
- Updated Redux to use Redux Toolkit
