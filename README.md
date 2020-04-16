# What's this?

This web-app is created with Firebase platform. The master branch is only the project bootstrap that connect Firebase's services (Firestore database and auth system) to the application. The master branch can be reused as boilerplate in creating Firebase webapps, while the encelerate branch is the full invoice system.

## Project bootsrap

The project utilize _no_ class based components, with all side-effects and states managed using [React Hooks](https://reactjs.org/docs/hooks-overview.html).

The project bootstrap (master branch) was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) with added [redux](https://redux.js.org), [react-redux](https://react-redux.js.org/), and [@reach-router](https://reach.tech/router) with [Bootstrap 4](https://getbootstrap.com/docs/4.0) and [react-bootsrap](https://react-bootstrap.github.io/) for _minimum_ styling. As such, `start`, `build` commands inherits from CRA. No testing is configured.

To setup the connectivity with firebase, set up `.env` file following `example.env`.

## Invoice app

The invoice app (*encelerate* branch) use a Firebase storage bucket to store logo images of created organizations, that should be publicly accessible. In addition, to be able to copy non-login single view invoice, the application's domain should be configured. 

As such, if you want to deploy the invoice app, you'll need to: 
1. Configure `REACT_APP_DOMAIN` in `.env` to where the application domain will be hosted (can be hosted on Firebase hosting)
2. Configure `REACT_APP_IMAGE_FILES_DOMAIN` in `.env` to point to domain of firebase-managed storage bucket.
2. Deploy firestore security rules (`firebase-setup/firestore.rules`).
3. Deploy firebase function to return invoice data in single invoice view URL (in `firebase-setup/functions`) directory (need separate `npm install` from the project).
4. Deploy firebase storage rules (`firebase-setup/storage.rules`).
5. Configure and deploy `firebase.json` hosting in order to enable sharable single invoice view URL (as in `firebase-setup/firebase.json`). Configure `REACT_APP_FUNCTION_PATH` in `.env` in accordance with rewrite in `firebase.json` as the single invoice view URL will directly call firebase function for the data source. `REACT_APP_FUNCTION_DOMAIN` in `.env` _must_ be the Firebase hosted domain in which the function is deployed.

`firebase-setup/firebase.json` sets the public hosting directory to `build` folder _inside_ the `firebase-setup` directory. The React application build result should be moved in there in order for it to be deployed to Firebase hosting (or create `build` folder with any `index.html` and any content inside, if the main application will be deployed on different domain than Firebase hosted domain).

Note that `example.env` only includes invoice-app specific settings in the *encelerate* branch.
