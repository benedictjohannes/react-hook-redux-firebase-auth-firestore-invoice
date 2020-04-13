import React from 'react';
import {Provider, useSelector, useDispatch, shallowEqual} from 'react-redux';
import {createStore, combineReducers} from 'redux';

import sessionReducer from './session';
import loginLogoutReducer from './login_logout';
import organizationReducer from './organizations';
import activeOrganizationReducer from './activeOrganization';
import maskDivReducer from './maskDiv';
import userDataReducer from './userData'
import searchClientOrganizationsReducer from './searchClientOrganizations'
import editInvoiceReducer from './editInvoice'
import invoicesReducer from './invoices'

const reducers = {
    activeOrganization: activeOrganizationReducer,
    editInvoice: editInvoiceReducer,
    invoices: invoicesReducer,
    login_logout: loginLogoutReducer,
    maskDiv: maskDivReducer,
    organizations: organizationReducer,
    searchClientOrganizations: searchClientOrganizationsReducer,
    session: sessionReducer,
    userData: userDataReducer,
}

export const stateKeys = Object.keys(reducers)

export const rootReducer = combineReducers(reducers);

export const store = createStore(
    rootReducer,
    process.env.NODE_ENV !== 'production' &&
        window.__REDUX_DEVTOOLS_EXTENSION__ &&
        window.__REDUX_DEVTOOLS_EXTENSION__({trace: true, traceLimit: 50})
);

const ReduxProvider = ({children}) => <Provider store={store}>{children}</Provider>;

const useShallowSelector = cond => useSelector(cond, shallowEqual);

export const applyPayloadOrNull = (_, action) => (action.payload ? action.payload : null);
export const applyMergePayloadObject = (state, action) => action.payload ? {...state, ...action.payload} : state

export {default as actions} from './actions';

export {useSelector, useDispatch, useShallowSelector};

export default ReduxProvider;
