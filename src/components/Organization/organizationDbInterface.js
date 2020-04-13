import {actions} from '../../redux';

export const syncOrganizations = ({firebase, session, dispatch}) => {
    if (!(session && session.email)) return;
    return firebase.organizations()
        .where('members', 'array-contains', session.email)
        .onSnapshot( snapshot => {
            if (snapshot.empty) {
                dispatch({type: actions.ORGANIZATIONS_SET, payload: []});
            } else {
                let organizations = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
                dispatch({type: actions.ORGANIZATIONS_SET, payload: organizations});
            }
        })
};

export const setActiveToOrganizationById = ({firebase, dispatch, id}) => {
    dispatch({type: actions.ACTIVE_ORGANIZATION_SET, payload: {to: false}})
    return firebase.organization(id).get().then(snapshot => {
        if (snapshot.exists) {
            let data = snapshot.data()
            dispatch({type: actions.ACTIVE_ORGANIZATION_SET, payload: {to: {id: id, ...data}}})
        } else {
            dispatch({type: actions.ACTIVE_ORGANIZATION_SET, payload: {to: false}})
        }
    })
}


export const searchClientOrganizationsByEmail = ({firebase, dispatch, session, email}) => {
    if (!session) return;
    firebase.organizations()
        .where('members', 'array-contains', email)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                dispatch({type: actions.ORGANIZATION_CLIENTS_SEARCH_SET, payload: []});
            } else {
                let results = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
                dispatch({type: actions.ORGANIZATION_CLIENTS_SEARCH_SET, payload: results});
            }
        })
        .catch(e =>
            dispatch({
                type: actions.MASKDIV_SET,
                payload: {
                    dismissable: true,
                    showSpinner: false,
                    title: 'Error retrieving your client organizations list',
                    message: JSON.stringify(e.message)
                }
            })
        );
};
