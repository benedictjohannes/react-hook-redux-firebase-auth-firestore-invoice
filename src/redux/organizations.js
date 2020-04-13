import actions from './actions'
import {applyPayloadOrNull} from './index'

const initialState = null

const organizationReducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.ORGANIZATIONS_SET: 
            return applyPayloadOrNull(state,action)
        default: return state
    }
}

export default organizationReducer