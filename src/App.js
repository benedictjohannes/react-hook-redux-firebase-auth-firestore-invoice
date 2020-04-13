import React, {useEffect} from 'react';
import './App.scss';
import useFirebase from './firebase';
import {useDispatch, actions, useSelector} from './redux';
import {Router} from '@reach/router';

import NavMenu from './components/NavMenu';

import NeedAuthentication, {syncUserData} from './components/LoginLogout';
import Home from './components/Home';

import InvoiceList, {InvoiceView, SingleInvoiceViewer} from './components/invoice/V1';
import {OrganizationDisplay, OrganizationList, ClientOrganization, syncOrganizations} from './components/Organization';



const Layout = ({children}) => (
    <div>
        <NavMenu />
        {children}
    </div>
);

const App = () => {
    const firebase = useFirebase();
    const dispatch = useDispatch();
    const session = useSelector(state => state.session);
    useEffect(
        () =>
            firebase.authStateListener(
                authUser => dispatch({type: actions.AUTH_USER_SET, payload: authUser}),
                () => dispatch({type: actions.AUTH_USER_SET})
            ),
        [firebase, dispatch]
    );
    useEffect(() => {
        if (!session) return;
        return syncUserData({firebase, dispatch, session});
    }, [firebase, dispatch, session]);
    useEffect(() => {
        if (!session) return;
        return syncOrganizations({firebase, dispatch, session});
    }, [firebase, dispatch, session]);
    return (
        <Router>
            <Layout path='/'>
                <Home path='/' />
                <SingleInvoiceViewer path='/view_single_invoice/:invoiceId'/>
                <NeedAuthentication path='/'>
                    <ClientOrganization path='/clients' />
                    <InvoiceList path='/invoices' />
                    <InvoiceView path='/invoices/create' />
                    <OrganizationList path='/organizations' />
                    <OrganizationDisplay path='/organizations/create' />
                    <OrganizationDisplay path='/organizations/manage/:organizationId' />
                </NeedAuthentication>
            </Layout>
        </Router>
    );
};

export default App;
