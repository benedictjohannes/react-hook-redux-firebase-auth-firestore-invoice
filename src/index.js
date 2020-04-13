import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {FirebaseProvider} from './firebase';
import ReduxProvider from './redux';
import MaskDiv from './components/MaskDiv'

ReactDOM.render(
    <ReduxProvider>
        <FirebaseProvider>
            <MaskDiv/>
            <App />
        </FirebaseProvider>
    </ReduxProvider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
