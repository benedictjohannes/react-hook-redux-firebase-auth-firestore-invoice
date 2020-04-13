import actions from './actions'
import {applyPayloadOrNull} from './index'

const initialState = null

const sessionReducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.AUTH_USER_SET: 
            return applyPayloadOrNull(state,action)
        default: return state
    }
}

export default sessionReducer