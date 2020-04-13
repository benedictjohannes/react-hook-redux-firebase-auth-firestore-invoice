import actions from './actions'

const initialState = {fromInvoices: null, toInvoices: null, param: {}}

const setFrom = (state, action) => {
    let {payload} = action
    let {fromInvoices: stateFromInvoices} = state
    let {fromInvoices: payloadFromInvoices} = payload
    let newFromInvoices = {...stateFromInvoices, ...payloadFromInvoices}
    let newState = {...state, fromInvoices: newFromInvoices}
    return newState
}
const setTo = (state, action) => {
    let {payload} = action
    let {toInvoices: stateToInvoices} = state
    let {toInvoices: payloadToInvoices} = payload
    let newToInvoices = {...stateToInvoices, ...payloadToInvoices}
    let newState = {...state, toInvoices: newToInvoices}
    return newState
}
const setParam = (state, action) => {
    let {payload} = action
    let {param: payloadParam} = payload
    let {param: stateParam} = state
    let newParam = {...stateParam, ...payloadParam}
    let newState = {...state, param: newParam}
    return newState
}

const invoicesReducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.INVOICES_FROM_SET: 
            return setFrom(state,action)
        case actions.INVOICES_TO_SET: 
            return setTo(state,action)
        case actions.INVOICES_PARAM_SET: 
            return setParam(state,action)
        default: return state
    }
}

export default invoicesReducer