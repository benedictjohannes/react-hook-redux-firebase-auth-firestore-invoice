import actions from './actions'
import {applyPayloadOrNull} from './index'

const initialState = null

const clientOrganizationsReducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.ORGANIZATION_CLIENTS_SET: 
            return applyPayloadOrNull(state,action)
        default: return state
    }
}

export default clientOrganizationsReducer