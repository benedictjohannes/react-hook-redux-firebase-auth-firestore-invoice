import {actions} from '../../../redux';

export const getInvoicesByOrganizationId = ({firebase, session, dispatch, organizationId, direction}) => {
    if (!(session && organizationId && direction)) return;
    const dispatchType = direction==='from' ? actions.INVOICES_FROM_SET : actions.INVOICES_TO_SET
    firebase
        .invoices()
        .where(`${direction}.id`, '==', organizationId)
        .get()
        .then(snapshot => {
            let payloadToSet = {}
            payloadToSet[`${direction}Invoices`] = {}
            if (snapshot.empty) {
                payloadToSet[`${direction}Invoices`][organizationId] = []
                dispatch({type: dispatchType, payload: payloadToSet });
            } else {
                let results = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
                payloadToSet[`${direction}Invoices`][organizationId] = results
                dispatch({type: dispatchType, payload: payloadToSet });
            }
        })
        .catch(e =>
            dispatch({
                type: actions.MASKDIV_SET,
                payload: {
                    dismissable: true,
                    showSpinner: false,
                    title: 'Error retrieving your invoice list',
                    message: JSON.stringify(e.message)
                }
            })
        );
};
