import React, {createContext, useContext} from 'react'

import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    projectId: process.env.REACT_APP_PROJECT_ID,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DATABASE_URL,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    apiId: process.env.REACT_APP_API_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID,
  };

class Firebase {
    constructor() {
        app.initializeApp(firebaseConfig)
        
        /* Firebase APIs */
        this.auth = app.auth();
        this.db = app.firestore();
        this.firestore = app.firestore;
        this.storage = app.storage().ref()
        
        /* Auth Providers */
        this.emailAuthProvider = app.auth.EmailAuthProvider;
        this.googleProvider = new app.auth.GoogleAuthProvider();
        this.facebookProvider = new app.auth.FacebookAuthProvider();
        this.twitterProvider = new app.auth.TwitterAuthProvider();
    }
    
    /* Auth Helpers */

    createUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

    signInWithEmailAndPassword = (email, password) =>
        this.auth.signInWithEmailAndPassword(email, password);

    signInWithGoogle = () =>
        this.auth.signInWithPopup(this.googleProvider);

    signInWithFacebook = () =>
        this.auth.signInWithPopup(this.facebookProvider);

    signOut = () => this.auth.signOut();

    sendEmailVerification = () =>
    this.auth.currentUser.sendEmailVerification({
        url: process.env.REACT_APP_CONFIRMATION_EMAIL_REDIRECT,
    });
    
    passwordReset = email => this.auth.sendPasswordResetEmail(email);
    
    passwordUpdate = password =>
        this.auth.currentUser.updatePassword(password);

    /* Databases */
    users = () => this.db.collection('users');
    user = uid => this.db.collection('users').doc(uid)
    invoices = () => this.db.collection('invoices');
    invoice = iid => this.db.collection('invoices').doc(iid);
    organizations = () => this.db.collection('organizations');
    organization = oid => this.db.collection('organizations').doc(oid);

    /* Auth state listener */
    authStateListener = (authorize,unauthorize) => {
        this.auth.onAuthStateChanged(async authUser => {
            if (authUser) return authorize(authUser)
            return unauthorize()
        })
    }
}

const useFirebase = () => useContext(FirebaseContext)

export {Firebase}

export const FirebaseContext = createContext(null)

export const FirebaseProvider = ({children}) => <FirebaseContext.Provider value={new Firebase()}>{children}</FirebaseContext.Provider>

export default useFirebase




