# What's this?

This web-app is created with Firebase platform. The master branch is only the project bootstrap that connect Firebase's services (Firestore database and auth system) to the application. The master branch can be reused as boilerplate in creating Firebase webapps, while the encelerate branch is the full invoice system.

## Project bootsrap

The project utilize _no_ class based components, with all side-effects and states managed using [React Hooks](https://reactjs.org/docs/hooks-overview.html).

The project bootstrap (master branch) was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) with added [redux](https://redux.js.org), [react-redux](https://react-redux.js.org/), and [@reach-router](https://reach.tech/router) with [Bootstrap 4](https://getbootstrap.com/docs/4.0) and [react-bootsrap](https://react-bootstrap.github.io/) for _minimum_ styling. As such, `start`, `build` commands inherits from CRA. No testing is configured.
