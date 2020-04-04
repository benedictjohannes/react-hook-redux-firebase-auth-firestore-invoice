import actions from './actions'

const initialState = null

const applySetAuthUser = (_, action) => action.authUser ? action.authUser : null

const sessionReducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.AUTH_USER_SET: 
            return applySetAuthUser(state,action)
        default: return state
    }
}

export default sessionReducer