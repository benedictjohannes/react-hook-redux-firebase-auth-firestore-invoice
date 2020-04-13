import actions from './actions'
import {applyMergePayloadObject} from './index'

const initialState = null

const userDataReducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.USERDATA_SET: 
            return applyMergePayloadObject(state,action)
        default: return state
    }
}

export default userDataReducer