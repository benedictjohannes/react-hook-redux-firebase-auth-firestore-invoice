import actions from './actions'
import {applyPayloadOrNull} from './index'

const initialState = false

const maskDivReducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.MASKDIV_SET: 
            return applyPayloadOrNull(state,action)
        default: return state
    }
}

export default maskDivReducer