import actions from './actions'
import {applyMergePayloadObject} from './index'

const initialState = {}

const searchClientOrganizationsReducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.ORGANIZATION_CLIENTS_SEARCH_SET: 
            return applyMergePayloadObject(state,action)
        default: return state
    }
}

export default searchClientOrganizationsReducer