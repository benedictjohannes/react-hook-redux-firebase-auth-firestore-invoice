import React from 'react'
import {Provider, useSelector, useDispatch, shallowEqual } from 'react-redux'
import { createStore, combineReducers } from 'redux';

import sessionReducer from './session'
import loginLogoutReducer from './login_logout'

export const rootReducer = combineReducers({
    session: sessionReducer,
    login_logout: loginLogoutReducer
})

export const store = createStore(rootReducer, process.env.NODE_ENV!=='production'&& window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())

const ReduxProvider = ({children}) => <Provider store={store}>
    {children}
</Provider>

const useShallowSelector = cond => useSelector(cond, shallowEqual)

export {default as actions} from './actions'

export {useSelector, useDispatch, useShallowSelector}

export default ReduxProvider