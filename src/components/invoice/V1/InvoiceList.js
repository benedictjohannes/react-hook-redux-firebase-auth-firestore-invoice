import React, {useState, useCallback, useEffect} from 'react';

import {Container, Row, Col, Button, Nav} from 'react-bootstrap';
import {navigate, Link} from '@reach/router';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheckCircle, faTimes, faEdit, faCopy, faEye, faShare} from '@fortawesome/free-solid-svg-icons';

import {actions, useDispatch, useSelector} from '../../../redux';
import useFirebase from '../../../firebase';
import {getInvoicesByOrganizationId} from './invoiceDbInterface';
import {statusMap, availableStatus, availableStatusTo} from './statusInterface';
import InvoiceEditor, {processTotalEntries} from './InvoiceV1';
import {rpDisplay, dateToYyyyMmDd} from '../../helperFunctions';

const InvoiceList = () => {
    const dispatch = useDispatch();
    const firebase = useFirebase();
    const session = useSelector(state => state.session);
    const {from, fromInvoices, toInvoices, param} = useSelector(state => {
        let {activeOrganization, invoices} = state;
        let {from} = activeOrganization;
        let {param, fromInvoices, toInvoices} = invoices;
        return {from, fromInvoices, toInvoices, param};
    });
    const {direction = 'from', viewSingleInvoice = false} = param;
    const setDirection = dir => dispatch({type: actions.INVOICES_PARAM_SET, payload: {param: {direction: dir}}});
    const invoiceDataSource = direction === 'from' ? fromInvoices : toInvoices;
    const organizationId = from && from.id;
    const validOrganizationId = typeof organizationId === 'string';
    const invoicesData =
        validOrganizationId && invoiceDataSource && invoiceDataSource[organizationId]
            ? invoiceDataSource[organizationId]
            : false;
    const getData = useCallback(
        () => getInvoicesByOrganizationId({firebase, session, dispatch, organizationId, direction}),
        [firebase, session, dispatch, organizationId, direction]
    );
    const changeOrganization = () => navigate('/organizations');
    if (!invoicesData && validOrganizationId) {
        getData();
    }
    const cancelViewSingleInvoice = useCallback(() => {
        getData();
        dispatch({type: actions.INVOICES_PARAM_SET, payload: {param: {viewSingleInvoice: false}}});
        dispatch({type: actions.EDIT_INVOICE_SET, payload: {originalInvoice: null, currentInvoice: null}});
    }, [dispatch, getData]);
    const setViewSingleInvoice = i => {
        const data = invoicesData.find(invoice => invoice.id === i);
        dispatch({type: actions.EDIT_INVOICE_SET, payload: {originalInvoice: {...data}}});
        dispatch({type: actions.INVOICES_PARAM_SET, payload: {param: {viewSingleInvoice: i}}});
    };
    const copyInvoice = i => {
        const data = invoicesData.find(invoice => invoice.id === i);
        const copiedData = {...data}
        delete copiedData.id
        delete copiedData.invoice_status
        delete copiedData.invoice_date
        delete copiedData.invoice_no
        dispatch({type: actions.EDIT_INVOICE_SET, payload: {originalInvoice: copiedData}});
        navigate('/invoices/create')
        dispatch({type: actions.INVOICES_PARAM_SET, payload: {param: {viewSingleInvoice: false}}});
    }
    const copyInvoiceLink = id => {
        navigator.clipboard
            .writeText(`https://${process.env.REACT_APP_DOMAIN}/view_single_invoice/${id}`)
            .then(_ => {})
            .catch(_ => {});
    };

    const updateStatus = useCallback(
        (id, newStatus) => {
            const dispatchType = direction === 'from' ? actions.INVOICES_FROM_SET : actions.INVOICES_TO_SET;
            const dataDest = direction === 'from' ? 'fromInvoices' : 'toInvoices';
            firebase
                .invoice(id)
                .set({invoice_status: newStatus}, {merge: true})
                .then(_ => {
                    let toSet = {};
                    toSet[dataDest] = invoiceDataSource;
                    let index = toSet[dataDest][organizationId].findIndex(invoice => invoice.id === id);
                    toSet[dataDest][organizationId][index]['invoice_status'] = newStatus;
                    dispatch({type: dispatchType, payload: toSet});
                })
                .catch(e =>
                    dispatch({
                        type: actions.MASKDIV_SET,
                        payload: {
                            dismissable: true,
                            showSpinner: false,
                            title: 'Error updating invoice status list',
                            message: JSON.stringify(e.message)
                        }
                    })
                );
        },
        [dispatch, firebase, organizationId, invoiceDataSource, direction]
    );
    return (
        <>
            {!viewSingleInvoice && (
                <Container>
                    <Row>
                        <Col>
                            <Nav variant='tabs mt-3 mb-3'>
                                <Nav.Item>
                                    <Nav.Link active={direction === 'from'} onClick={() => setDirection('from')}>
                                        Invoices from me
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link active={direction === 'to'} onClick={() => setDirection('to')}>
                                        Invoices for me
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item className='ml-auto'>
                                    <Nav.Link className='btn btn-outline-secondary' onClick={changeOrganization}>
                                        Change Organization
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link className='btn btn-outline-secondary' onClick={getData}>
                                        Refresh
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link as={Link} to='create'>
                                        Create
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                    </Row>
                    <Row>
                        <Col className='overflow-auto'>
                            {invoicesData && invoicesData.length ? (
                                <InvoiceListTable
                                    invoices={invoicesData}
                                    {...{updateStatus, direction, setViewSingleInvoice, copyInvoiceLink, copyInvoice}}
                                />
                            ) : (
                                <div className='my-5 text-center'>
                                    <h1>No Invoices (yet)</h1>
                                </div>
                            )}
                        </Col>
                    </Row>
                </Container>
            )}
            {!!viewSingleInvoice && (
                <InvoiceEditor editable={direction === 'from'} cancelEditInvoice={cancelViewSingleInvoice} />
            )}
        </>
    );
};

const CopierButton = ({id, copyInvoiceLink}) => {
    const [copyVisible, setCopyVisible] = useState(false);
    const doCopy = () => {
        setCopyVisible(true);
        copyInvoiceLink(id);
        setTimeout(() => setCopyVisible(false), 3000);
    };
    return (
        <button className={`btn ${copyVisible ? 'btn-success' : 'btn-primary'}`} onClick={doCopy}>
            <FontAwesomeIcon icon={copyVisible ? faCheckCircle : faShare} />
        </button>
    );
};

const InvoiceListTable = ({invoices, direction, updateStatus, setViewSingleInvoice, copyInvoiceLink, copyInvoice}) => (
    <table className='table table-hover'>
        <thead>
            <tr>
                <th width='12%'>Date</th>
                <th width='15%'>No</th>
                <th width='15%'>Value</th>
                <th width='23%'>{direction === 'from' ? 'To' : 'From'}</th>
                <th width='22%'>Status</th>
                <th width='13%' className='text-right'>
                    Actions
                </th>
            </tr>
        </thead>
        <tbody>
            {invoices.map((invoice) => {
                const {invoice_date, invoice_no, entries, invoice_status = '1', id} = invoice;
                const destination = direction === 'from' ? invoice.to.name : invoice.from.name;
                return (
                    <tr key={invoice.id}>
                        <td className='align-middle'>{dateToYyyyMmDd(invoice_date)} </td>
                        <td className='align-middle'>{invoice_no} </td>
                        <td className='align-middle'>{rpDisplay(processTotalEntries(entries))}</td>
                        <td className='align-middle'>{destination}</td>
                        <td className='align-middle'>
                            <StatusCell
                                invoice_status={invoice_status}
                                updateStatus={updateStatus}
                                id={id}
                                direction={direction}
                            />
                        </td>
                        <td className='align-middle'>
                            <div className='d-flex flex-row justify-content-end'>
                                <CopierButton {...{id, copyInvoiceLink}} />
                                <button className='btn btn-primary ml-2' onClick={() => setViewSingleInvoice(id)}>
                                    <FontAwesomeIcon icon={faEye} />
                                </button>
                                <button className='btn btn-primary ml-2' onClick={() => copyInvoice(id)}>
                                    <FontAwesomeIcon icon={faCopy} />
                                </button>
                            </div>
                        </td>
                    </tr>
                );
            })}
        </tbody>
    </table>
);

const StatusCell = ({invoice_status, updateStatus, id, direction}) => {
    const [status, setStatus] = useState(invoice_status);
    const [editing, setEditing] = useState(false);
    const saveEdit = () => {
        updateStatus(id, status);
        setEditing(false);
    };
    const cancelEdit = () => {
        setEditing(false);
    };
    useEffect(() => setStatus(invoice_status), [invoice_status]);
    const usedAvailableStatus = direction === 'from' ? availableStatus : availableStatusTo;
    return (
        <div className='d-flex flex-row align-items-center justify-content-between'>
            {editing ? (
                <>
                    <select className='form-control' value={status} onChange={e => setStatus(e.target.value)}>
                        {Object.keys(statusMap).map(s => (
                            <option disabled={!usedAvailableStatus[invoice_status].includes(s)} key={s} value={s}>
                                {statusMap[s]}
                            </option>
                        ))}
                    </select>
                    <Button variant='danger' className='px-2 py-1 ml-1' onClick={cancelEdit}>
                        <FontAwesomeIcon icon={faTimes} />
                    </Button>
                    <Button variant='success' className='px-2 py-1 ml-1' onClick={saveEdit}>
                        <FontAwesomeIcon icon={faCheckCircle} />
                    </Button>
                </>
            ) : (
                <>
                    <p className='font-weight-bold py-1 mb-0'>{statusMap[invoice_status]}</p>
                    {direction === 'from' || invoice_status === '2' ? (
                        <Button
                            className='px-2 py-1 ml-1'
                            onClick={() => setEditing(true)}
                            disabled={!usedAvailableStatus[invoice_status].length}
                        >
                            <FontAwesomeIcon icon={faEdit} />
                        </Button>
                    ) : null}
                </>
            )}
        </div>
    );
};

export default InvoiceList;
