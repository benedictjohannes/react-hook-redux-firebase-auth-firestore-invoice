import actions from './actions'
import {applyMergePayloadObject} from './index'

const initialState = {}

const editInvoiceReducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.EDIT_INVOICE_SET: 
            return applyMergePayloadObject(state,action)
        default: return state
    }
}

export default editInvoiceReducer