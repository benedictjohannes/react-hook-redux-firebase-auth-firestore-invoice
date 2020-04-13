import React, {useState} from 'react';

import * as yup from 'yup';
import 'react-dropzone-uploader/dist/styles.css';
import {Container, Row, Col, Nav} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEdit, faTrash, faCheckCircle, faTimes, faSpinner} from '@fortawesome/free-solid-svg-icons';
import {navigate} from '@reach/router';

import {useShallowSelector, actions, useDispatch, useSelector} from '../../redux';
import useFirebase from '../../firebase';

import {OrganizationDataViewer} from './OrganizationDisplay';
import {setActiveToOrganizationById} from './organizationDbInterface';

const ClientOrganizationList = () => {
    const [addingClient, setAddingClient] = useState(false);
    const dispatch = useDispatch();
    const firebase = useFirebase();
    const session = useShallowSelector(state => state.session);
    const clients = useSelector(state => (state.userData ? state.userData.clients : null));
    const activeOrganization = useShallowSelector(state => state.activeOrganization);
    const activeId =
        activeOrganization && activeOrganization.to && activeOrganization.to.id ? activeOrganization.to.id : null;
    const replaceClient = (i, data) => {
        const newClients = [...clients];
        newClients.splice(i, 1, data);
        firebase.user(session.uid).set({clients: newClients}, {merge: true});
        dispatch({type: actions.USERDATA_SET, payload: {clients: newClients}});
    };
    const deleteClient = i => {
        const newClients = [...clients];
        newClients.splice(i, 1);
        firebase.user(session.uid).set({clients: newClients}, {merge: true});
        dispatch({type: actions.USERDATA_SET, payload: {clients: newClients}});
    };
    return (
        <Container>
            <Row>
                <Col>
                    <Nav variant='tabs mt-3 mb-3'>
                        <Nav.Item>
                            <Nav.Link active={!addingClient} onClick={() => setAddingClient(false)}>
                                Clients
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link active={addingClient} onClick={() => setAddingClient(true)}>
                                Add Client
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Col>
            </Row>
            {addingClient ? (
                <Row>
                    <Col>
                        <p className='mb-1 h4'>
                            Add organization client to your account by searching for email address of organization
                            members
                        </p>
                    </Col>
                </Row>
            ) : null}
            <Row>
                <Col className='overflow-auto align-items-center d-flex flex-column'>
                    {addingClient ? (
                        <ClientAdder backToList={() => setAddingClient(false)} />
                    ) : (
                        <div className='overflow-auto w-100'>
                            {!clients ? (
                                <h1 className='my-5'>Fetching your Clients.</h1>
                            ) : clients.length ? (
                                <ClientListTable
                                    clients={clients}
                                    replaceClient={replaceClient}
                                    deleteClient={deleteClient}
                                    activeId={activeId}
                                />
                            ) : (
                                <>
                                    <h1 className='my-5'>You have no saved clients.</h1>
                                    <button className='btn btn-primary' onClick={() => setAddingClient(true)}>
                                        Add Clients
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

const ClientListTable = ({clients, replaceClient, deleteClient, activeId}) => (
    <table className='table table-hover'>
        <thead>
            <tr>
                <th width='50%'>Organization</th>
                <th width='30%'>Alias</th>
                <th width='20%' className='text-right'>
                    Actions
                </th>
            </tr>
        </thead>
        <tbody>
            {clients.map((client, index) => (
                <ClientTableRow
                    client={client}
                    setClient={data => replaceClient(index, data)}
                    deleteClient={() => deleteClient(index)}
                    activeId={activeId}
                    key={index}
                />
            ))}
        </tbody>
    </table>
);

const ClientTableRow = ({client, setClient, deleteClient, activeId}) => {
    const [alias, setAlias] = useState(client.alias);
    const [editing, setEditing] = useState(false);
    const dispatch = useDispatch();
    const firebase = useFirebase();
    return (
        <tr>
            <td className='align-middle'>
                <div className='d-flex flex-row align-items-center' style={{height: 100}}>
                    <div className='previewLogoSq'>
                        <img src={client.logoUrl} alt='Organization Logo' />
                    </div>
                    <p className='h4 mb-0 ml-3'>{client.name}</p>
                </div>
            </td>
            <td className='align-middle'>
                <div className='d-flex flex-row'>
                    {editing ? (
                        <input className='form-control' value={alias} onChange={e => setAlias(e.target.value)} />
                    ) : (
                        <p className='h4 mb-0 ml-2'>{client.alias ? client.alias : 'Not set'}</p>
                    )}
                </div>
            </td>
            <td className='align-middle'>
                <div className='d-flex flex-row'>
                    {editing ? (
                        <>
                            <button
                                className='btn btn-danger ml-auto'
                                onClick={() => {
                                    setEditing(false);
                                    setAlias(client.alias);
                                }}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                            <button
                                className='btn btn-success ml-2'
                                onClick={() => {
                                    setEditing(false);
                                    setClient({...client, alias: alias});
                                }}
                            >
                                <FontAwesomeIcon icon={faCheckCircle} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button className='btn btn-danger ml-auto' onClick={() => deleteClient()}>
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                            <button className='btn btn-success ml-2' onClick={() => setEditing(true)}>
                                <FontAwesomeIcon icon={faEdit} />
                            </button>
                        </>
                    )}
                </div>
                <div className='d-flex flex-row justify-content-end mt-2'>
                    <button
                        className={`btn btn-sm ${client.id === activeId ? 'btn-warning' : 'btn-primary'}`}
                        onClick={() => {
                            if (client.id === activeId) return navigate('/invoices/create');
                            let req = setActiveToOrganizationById({firebase, dispatch, id: client.id});
                            if (req) navigate('/invoices/create');
                        }}
                    >
                        Send Invoice
                    </button>
                </div>
            </td>
        </tr>
    );
};

const ClientAdder = ({backToList}) => {
    const yupSchema = React.useCallback(
        yup.object().shape({
            email: yup
                .string()
                .required()
                .email()
        }),
        []
    );
    const firebase = useFirebase();
    const dispatch = useDispatch();
    const session = useSelector(state => state.session);
    const search = useSelector(state => state.searchClientOrganizations);
    const userData = useSelector(state => state.userData);
    const [query, setQuery] = useState(search && search.query ? search.query : null);
    const [validQuery, setValidQuery] = useState(null);
    const [alias, setAlias] = useState(null);
    const handleQueryChange = e => {
        const {value} = e.target;
        setQuery(value);
        yupSchema
            .validate({email: value})
            .then(valid => setValidQuery(valid))
            .catch(_ => {
                setValidQuery(false);
            });
    };
    const handleQuerySubmit = () => {
        dispatch({type: actions.ORGANIZATION_CLIENTS_SEARCH_SET, action: {query: query, results: null, loading: true}});
        firebase
            .organizations()
            .where('members', 'array-contains', query)
            .get()
            .then(snapshot => {
                if (snapshot.empty) {
                    dispatch({type: actions.ORGANIZATION_CLIENTS_SEARCH_SET, payload: {loading: false, results: []}});
                } else {
                    let organizations = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
                    dispatch({
                        type: actions.ORGANIZATION_CLIENTS_SEARCH_SET,
                        payload: {loading: false, results: organizations}
                    });
                }
            });
    };
    const addClient = () => {
        const {selected, results} = search;
        const organization = results[selected];
        const toInsert = {
            id: organization.id,
            name: organization.name,
            logoUrl: organization.logoUrl,
            alias: alias
        };
        const newClients =
            userData && userData.clients && typeof userData.clients === 'object' && userData.clients.length
                ? [...userData.clients]
                : [];
        if (newClients.findIndex(r => r.id === toInsert.id) < 0) {
            newClients.push(toInsert);
            firebase
                .user(session.uid)
                .set({clients: newClients, updatedAt: firebase.firestore.FieldValue.serverTimestamp()}, {merge: true});
            dispatch({type: actions.ORGANIZATION_CLIENTS_SEARCH_SET, payload: {selected: null}});
        }
        backToList();
    };
    return (
        <>
            {!Number.isFinite(search.selected) && (
                <div className='d-flex flex-row align-items-center w-100 mb-5'>
                    <div className='flex-shrink-0'>
                        <p className='mb-0'>Search Email:</p>
                    </div>
                    <input
                        className={`mx-3 flex-grow-1 form-control ${validQuery === false ? 'is-invalid' : ''}`}
                        onChange={handleQueryChange}
                        value={query}
                    />
                    <button disabled={!validQuery} className='btn btn-primary btn-sm' onClick={handleQuerySubmit}>
                        Search
                        {search.loading && <FontAwesomeIcon size='xs' icon={faSpinner} spin />}
                    </button>
                </div>
            )}
            {!Number.isFinite(search.selected) && search.results && search.results.length ? (
                <Row>
                    {search.results.map((organization, index) => (
                        <OrganizationCards
                            key={index}
                            organization={organization}
                            setSelected={() => {
                                setAlias(search.results[index].name);
                                dispatch({type: actions.ORGANIZATION_CLIENTS_SEARCH_SET, payload: {selected: index}});
                            }}
                        />
                    ))}
                </Row>
            ) : !Number.isFinite(search.selected) && search.results ? (
                <h1 className='my-5'>Your Search returned No Results</h1>
            ) : null}
            {Number.isFinite(search.selected) && search.results && search.results.length && (
                <Row>
                    <Col xs={12} sm={{offset: 1, span: 10}} md={{offset: 2, span: 8}} lg={{offset: 3, span: 6}}>
                        <Row>
                            <Col xs={4} className='d-flex flex-column justify-content-center'>
                                <img
                                    className='w-100'
                                    src={search.results[search.selected].logoUrl}
                                    alt='Organization Logo'
                                />
                            </Col>
                            <Col xs={8}>
                                {
                                    <OrganizationDataViewer
                                        organizationData={search.results[search.selected]}
                                        dataOnly={true}
                                    />
                                }
                            </Col>
                            <Col>
                                <div className='d-flex flex-row align-items-baseline'>
                                    <p className='mb-0 mr-2'>Alias</p>
                                    <input
                                        onChange={e => setAlias(e.target.value)}
                                        value={alias}
                                        className='flex-grow-1 form-control mb-4 ml-2 mt-3 py-0'
                                    />
                                </div>
                                <div className='d-flex flex-row justify-content-between'>
                                    <button
                                        className='btn btn-outline-warning'
                                        onClick={() =>
                                            dispatch({
                                                type: actions.ORGANIZATION_CLIENTS_SEARCH_SET,
                                                payload: {selected: null}
                                            })
                                        }
                                    >
                                        Cancel
                                    </button>
                                    <button className='btn btn-primary' onClick={addClient}>
                                        Save to Client List
                                    </button>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            )}
        </>
    );
};

const OrganizationCards = ({organization, setSelected}) => (
    <Col xs={12} sm={6} xl={4}>
        <Row>
            <Col xs={4} className='d-flex flex-column justify-content-center'>
                <img className='w-100' src={organization.logoUrl} alt='Organization Logo' />
            </Col>
            <Col xs={8}>
                {<OrganizationDataViewer organizationData={organization} dataOnly={true} />}
                {setSelected && (
                    <button className='btn btn-primary' onClick={setSelected}>
                        Select
                    </button>
                )}
            </Col>
        </Row>
    </Col>
);

export default ClientOrganizationList;
