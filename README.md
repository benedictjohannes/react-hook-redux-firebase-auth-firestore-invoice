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
2. Configure `REACT_APP_IMAGE_FILES_DOMAIN` in `.env` to point to storage bucket of firebase-managed storage bucket.   
*see previous version*
2. Deploy firestore security rules (`firebase-setup/firestore.rules`).
3. Deploy firebase function to return invoice data in single invoice view URL (in `firebase-setup/functions`) directory (need separate `npm install` from the project).
4. Deploy firebase storage rules (`firebase-setup/storage.rules`).
5. Configure and deploy `firebase.json` hosting in order to enable sharable single invoice view URL (as in `firebase-setup/firebase.json`). Configure `REACT_APP_FUNCTION_PATH` in `.env` in accordance with rewrite in `firebase.json` as the single invoice view URL will directly call firebase function for the data source. `REACT_APP_FUNCTION_DOMAIN` in `.env` _must_ be the Firebase hosted domain in which the function is deployed.

`firebase-setup/firebase.json` sets the public hosting directory to `build` folder _inside_ the `firebase-setup` directory. The React application build result should be moved in there in order for it to be deployed to Firebase hosting (or create `build` folder with any `index.html` and any content inside, if the main application will be deployed on different domain than Firebase hosted domain).

Note that `example.env` only includes invoice-app specific settings in the *encelerate* branch.

### Image File Domain

Due to browsers blocking mixed content (`src=http://`) inside of `HTTPS` served pages, images uploaded into Google Cloud Storage is not displayed properly, as CNAME based GCS static file access only work with `HTTP`. 

To work around this, logo files are no longer saved prefixed with `http://REACT_APP_IMAGE_FILES_DOMAIN/path/to_img`, but with `https://storage.googleapis.com/REACT_APP_IMAGE_FILES_DOMAIN/path/to_img`.

For existing data (both `organization` and `invoice`), the files are _not_ deleted, but the URL should be updated to make the app work. Here's the code to do that: 

```javascript
// replace REACT_APP_IMAGE_FILES_DOMAIN with your .env values
const newPrefix = 'https://storage.googleapis.com/REACT_APP_IMAGE_FILES_DOMAIN'
const oldPrefix = 'http://REACT_APP_IMAGE_FILES_DOMAIN/'
const admin = require('firebase-admin')
admin.initializeApp();const db = admin.firestore()
db.collection('organizations').get().then(snapshot =>
    snapshot.forEach(async doc => {
        let id = doc.id
        let data = doc.data()
        if (data.logoUrl.startsWith(oldPrefix)) {
            data.logoUrl = data.logoUrl.replace(oldPrefix, newPrefix)
            await db.collection('organizations').doc(id).update(data)
        }
    })
)
db.collection('invoices').get().then(snapshot =>
    snapshot.forEach(async doc => {
        let id = doc.id;   let data = doc.data()
        let shouldUpdate = false
        if (typeof data.from === 'object' && data.from.logoUrl.startsWith(oldPrefix)) {
            shouldUpdate = true;  data.from.logoUrl = data.from.logoUrl.replace(oldPrefix, newPrefix)
        }
        if (typeof data.to === 'object' && data.to.logoUrl.startsWith(oldPrefix)) {
            shouldUpdate = true;  data.to.logoUrl = data.to.logoUrl.replace(oldPrefix, newPrefix)
        }
        if (shouldUpdate) await db.collection('invoices').doc(id).update(data)
    })
)
```