import actions from './actions'

const initialState = null

const applyCurrentLoginLogoutState = (state, action) => action.current ? {...state, current: action.current} : state

const loginLogoutReducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.LOGIN_LOGOUT_PAGE_SET: 
            return applyCurrentLoginLogoutState(state,action)
        default: return state
    }
}

export default loginLogoutReducer