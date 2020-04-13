import actions from './actions'
import {applyMergePayloadObject} from './index'

const initialState = {}

const activeOrganizationReducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.ACTIVE_ORGANIZATION_SET: 
            return applyMergePayloadObject(state,action)
        default: return state
    }
}

export default activeOrganizationReducer