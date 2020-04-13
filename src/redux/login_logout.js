import actions from './actions'
import {applyPayloadOrNull} from './index'

const initialState = null

const loginLogoutReducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.LOGIN_LOGOUT_PAGE_SET: 
            return applyPayloadOrNull(state,action)
        default: return state
    }
}

export default loginLogoutReducer