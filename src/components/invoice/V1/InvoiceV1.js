import React, {useState, useEffect, useCallback} from 'react';
import {Container, Row, Col, Button, Nav} from 'react-bootstrap';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheckCircle, faTimes, faEdit, faTrash, faPlus} from '@fortawesome/free-solid-svg-icons';

import {Link, navigate} from '@reach/router';
import ReactMarkdown from 'react-markdown';
import ReactMde from 'react-mde';
import 'react-mde/lib/styles/css/react-mde-all.css';

import {actions, useDispatch, useShallowSelector} from '../../../redux';

import {rpDisplay, intDisplay, extractNumber, dateToYyyyMmDd, apiHandler} from '../../helperFunctions';
import {OrganizationDataViewer} from '../../Organization';
import useFirebase from '../../../firebase';
import {v4 as uuidV4} from 'uuid';
import DatePicker from 'react-date-picker';
import {statusMap} from './statusInterface';

const seedData = {
    entries: [
        {
            description: `Exampe Item No. 1
Note that first line is bolded
Next lines are not`,
            quantity: 1,
            price: 1234567,
        },
        {
            description: `Product name on first line
Product details
On the next lines
`,
            quantity: 1,
            price: 12345678,
        },
    ],
    itemTotalName: 'Items Subtotal',
    totalAdjustments: [
        {
            name: 'Discount',
            resultName: 'Bill after discount',
            action: 'applyFactor',
            actionValue: -0.5,
        },
        {
            resultName: 'Bill before tax',
            name: 'Allowance for 2% Art. 23 tax',
            action: 'cancelFactor',
            actionValue: -0.02,
        },
        {
            action: 'chain',
            resultName: 'Final Invoice Bill',
            actionValue: [
                {
                    name: 'Rounding',
                    action: 'round',
                    actionValue: -3,
                },
                {
                    name: 'Proffessional discount',
                    action: 'applyAdd',
                    actionValue: -100000,
                },
            ],
        },
    ],
    remarks: `** More Information**

1. You can set more information here, such as:
2. Payment destination: 
    - Bank Account Number 1
    - Bank Account Number 2
3. Terms of payment
    - Pay faster for more discount!
`,
};

const fetchInvoice = async ({invoiceId, setInvoiceData, setLoading}) => {
    try {
        const fetchedRequest = await apiHandler(
            'POST',
            `${process.env.REACT_APP_FUNCTION_PATH}`,
            JSON.stringify({id: invoiceId})
        );
        const {data} = fetchedRequest;
        setInvoiceData(data);
        setLoading(!data);
    } catch (e) {
        setInvoiceData(e);
        setLoading(false);
    }
};

export const SingleInvoiceViewer = ({invoiceId}) => {
    const [loading, setLoading] = useState(true);
    const [invoiceData, setInvoiceData] = useState(null);
    useEffect(() => {
        fetchInvoice({invoiceId, setInvoiceData, setLoading});
    }, [invoiceId, setInvoiceData]);
    const printInvoice = useCallback(() => window.print(), []);
    useEffect(() => {
        if (!invoiceData) return;
        const timeOut = setTimeout(() => printInvoice(), 750);
        return () => clearTimeout(timeOut);
    }, [invoiceData, printInvoice]);
    if (loading)
        return (
            <Container className='my-3'>
                <Row>
                    <Col>
                        <h1>Fetching your Invoice</h1>
                    </Col>
                </Row>
            </Container>
        );
    if (!invoiceData || invoiceData.error || !invoiceData.from)
        return (
            <Container className='my-3'>
                <Row>
                    <Col>
                        <h1>Invoice not found</h1>
                    </Col>
                </Row>
            </Container>
        );
    return (
        <div>
            <Container className='my-3 d-print-none'>
                <Row>
                    <Col>
                        <button className='btn btn-primary float-right' onClick={printInvoice}>
                            Print
                        </button>
                    </Col>
                </Row>
            </Container>
            <V1 editable={false} currentInvoiceData={invoiceData} />;
        </div>
    );
};

const InvoiceEditor = ({cancelEditInvoice, editable = true}) => {
    const dispatch = useDispatch();
    const firebase = useFirebase();
    const activeOrganization = useShallowSelector((state) => state.activeOrganization);
    const {from, to} = activeOrganization;
    const reduxInvoice = useShallowSelector((state) => state.editInvoice);
    const {originalInvoice, currentInvoice} = reduxInvoice;
    const usedOriginalInvoiceData = originalInvoice && Object.keys(originalInvoice).length ? originalInvoice : seedData;
    const usedCurrentInvoiceData = currentInvoice && Object.keys(currentInvoice).length ? currentInvoice : null;
    const updateInvoice = useCallback(
        (data) => {
            dispatch({type: actions.EDIT_INVOICE_SET, payload: {currentInvoice: data}});
        },
        [dispatch]
    );
    const resetInvoice = useCallback(() => {
        dispatch({type: actions.EDIT_INVOICE_SET, payload: {currentInvoice: usedOriginalInvoiceData}});
    }, [dispatch, usedOriginalInvoiceData]);
    const submitInvoice = useCallback(async () => {
        if (!currentInvoice) return;
        const id = originalInvoice && originalInvoice.id ? originalInvoice.id : uuidV4();
        const setData = await firebase
            .invoice(id)
            .set({...currentInvoice, updatedAt: firebase.firestore.FieldValue.serverTimestamp()}, {merge: true});
        dispatch({type: actions.EDIT_INVOICE_SET, payload: {currentInvoice: null, originalInvoice: null}});
        navigate('/invoices');
        if (cancelEditInvoice) cancelEditInvoice();
        return setData;
    }, [dispatch, firebase, currentInvoice, originalInvoice, cancelEditInvoice]);
    return (
        <V1
            currentInvoiceData={usedCurrentInvoiceData}
            originalInvoiceData={usedOriginalInvoiceData}
            {...{editable, from, to, updateInvoice, resetInvoice, submitInvoice, cancelEditInvoice}}
        />
    );
};

const actionProcessor = {
    applyFactor: (originalValue, actionValue) => ({
        resultValue: originalValue * (1 + actionValue),
        diff: originalValue * actionValue,
    }),
    cancelFactor: (originalValue, actionValue) => ({
        resultValue: originalValue / (1 + actionValue),
        diff: originalValue / (1 + actionValue) - originalValue,
    }),
    applyAdd: (originalValue, actionValue) => ({
        resultValue: originalValue + actionValue,
        diff: actionValue,
    }),
    round: (originalValue, actionValue) => {
        let resultValue = Math.round(originalValue * Math.pow(10, actionValue)) / Math.pow(10, actionValue);
        return {
            resultValue,
            diff: resultValue - originalValue,
        };
    },
    chain: (originalValue, actionValue) => {
        let steps = actionValue.map((action) => ({
            value: actionProcessor[action.action](originalValue, action.actionValue).diff,
            description: action.name,
        }));
        let resultValue = steps.reduce((sum, curr) => sum + curr.value, originalValue);
        return {
            resultValue,
            diff: steps,
        };
    },
};
export const processTotalEntries = (entries) => entries.reduce((sum, curr) => sum + curr.quantity * curr.price, 0);

const NoOrganizationSelected = ({link, name, destination, editing}) => (
    <div className='my-4'>
        <h2 className='h2 text-danger'>
            No {name} to send {destination}
        </h2>
        {editing && (
            <Link className='btn btn-warning' to={link}>
                Select {name}
            </Link>
        )}
    </div>
);

const V1 = ({
    editable,
    currentInvoiceData,
    originalInvoiceData,
    submitInvoice,
    resetInvoice,
    updateInvoice,
    cancelEditInvoice,
    from,
    to,
}) => {
    const [data, setData] = useState(currentInvoiceData ? currentInvoiceData : originalInvoiceData);
    const [editing, setEditing] = useState(false);
    const {entries, totalAdjustments, remarks, itemTotalName, invoice_date, invoice_no, invoice_status = '1'} = data;
    const deleteRow = (index) => {
        const newEntries = [...entries];
        newEntries.splice(index, 1);
        setData({...data, entries: newEntries});
    };
    const replaceRow = (row, index) => {
        const newEntries = [...entries];
        newEntries.splice(index, 1, row);
        setData({...data, entries: newEntries});
    };
    const addRow = () => {
        const templateRow = {description: 'Item Description', price: 0, quantity: 0};
        const newEntries = [...entries];
        newEntries.push(templateRow);
        setData({...data, entries: newEntries});
    };
    const setItemTotalName = (value) => setData({...data, itemTotalName: value});
    const saveRemarks = (text) => setData({...data, remarks: text});
    const saveTotalAdjustments = (adjustments) => setData({...data, totalAdjustments: adjustments});
    useEffect(() => {
        if (!updateInvoice) return;
        updateInvoice(data);
    }, [data, updateInvoice]);
    useEffect(() => {
        setData((data) => ({...data, ...originalInvoiceData}));
    }, [originalInvoiceData]);
    useEffect(() => {
        if (editable && from && Object.keys(from).length) setData((data) => ({...data, from}));
        if (editable && to && Object.keys(to).length) setData((data) => ({...data, to}));
    }, [editable, data.from, data.to, from, to]);
    const validateData = (data) => {
        try {
            const {from, to, entries, itemTotalName, totalAdjustments, remarks, invoice_no, invoice_date} = data;
            const {name: nameFrom, detail: detailFrom, logoUrl: logoUrlFrom} = from;
            const {name: nameTo, detail: detailTo, logoUrl: logoUrlTo} = to;
            const {length: entriesLength} = entries;
            const {length: totalAdjustmentsLength} = totalAdjustments;
            const toReturn =
                from &&
                to &&
                entries &&
                itemTotalName &&
                totalAdjustments &&
                remarks &&
                invoice_no &&
                invoice_date &&
                nameFrom &&
                detailFrom &&
                logoUrlFrom &&
                nameTo &&
                detailTo &&
                logoUrlTo &&
                entriesLength &&
                totalAdjustmentsLength &&
                true;
            return toReturn;
        } catch (e) {
            console.log(e);
        }
        return false;
    };
    return (
        <div>
            <div id='floatingText'>
                <div>
                    <p>{statusMap[invoice_status]}</p>
                </div>
            </div>
            <Container className='d-print-none'>
                {(!!cancelEditInvoice || editable) && (
                    <Row>
                        <Col>
                            <Nav variant='tabs my-3'>
                                <Nav.Item>
                                    <Nav.Link active={!editing} onClick={() => setEditing(false)}>
                                        View
                                    </Nav.Link>
                                </Nav.Item>
                                {editable && ['1', '2'].includes(invoice_status) && (
                                    <>
                                        <Nav.Item>
                                            <Nav.Link active={editing} onClick={() => setEditing(true)}>
                                                Edit
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item className='ml-auto'>
                                            <Nav.Link
                                                className='btn btn-outline-secondary'
                                                onClick={() => {
                                                    !!resetInvoice && resetInvoice();
                                                    setData(originalInvoiceData);
                                                }}
                                            >
                                                Reset
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link
                                                className='btn btn-outline-primary'
                                                disabled={!(!!validateData(currentInvoiceData) && !!submitInvoice)}
                                                onClick={submitInvoice}
                                            >
                                                {originalInvoiceData.id ? 'Update' : 'Save'}
                                            </Nav.Link>
                                        </Nav.Item>
                                    </>
                                )}
                                {!!cancelEditInvoice && (
                                    <Nav.Item
                                        className={`${
                                            !(editable && ['1', '2'].includes(invoice_status)) ? 'ml-auto' : ''
                                        }`}
                                    >
                                        <Nav.Link className='btn btn-outline-secondary' onClick={cancelEditInvoice}>
                                            Back To List
                                        </Nav.Link>
                                    </Nav.Item>
                                )}
                            </Nav>
                        </Col>
                    </Row>
                )}
            </Container>
            <Container id='invoiceRoot'>
                <Row>
                    <Col xs={5} className='d-flex flex-column justify-content-end'>
                        {data.from ? (
                            <>
                                <OrganizationDataViewer organizationData={data.from} logoImg={data.from.logoUrl} />
                                {editing && !(originalInvoiceData && originalInvoiceData.from) && (
                                    <div className='align-self-end mb-3'>
                                        <Link className='btn btn-secondary' to={'/organizations'}>
                                            Change
                                        </Link>{' '}
                                    </div>
                                )}
                            </>
                        ) : (
                            <NoOrganizationSelected
                                destination='from'
                                name='organization'
                                link='/organizations'
                                editing={editing}
                            />
                        )}
                    </Col>
                    <Col xs={{span: 5, offset: 2}} className='d-flex flex-column justify-content-end'>
                        <h2 className='h1'>Invoice</h2>
                        <Row>
                            <Col xs={6}>
                                <p className={'mb-0 font-weight-bold'}>Invoice Date</p>
                                {editing ? (
                                    <DatePicker
                                        value={invoice_date ? new Date(invoice_date) : null}
                                        onChange={(value) =>
                                            setData({...data, invoice_date: new Date(value).getTime()})
                                        }
                                    />
                                ) : (
                                    <p>
                                        {invoice_date ? (
                                            dateToYyyyMmDd(invoice_date)
                                        ) : (
                                            <span className='text-danger'>(invoice date not set)</span>
                                        )}
                                    </p>
                                )}
                            </Col>
                            <Col xs={6}>
                                <p className={'mb-0 font-weight-bold'}>Invoice No.</p>
                                {editing ? (
                                    <input
                                        className='form-control form-control-sm'
                                        value={invoice_no}
                                        onChange={(e) => setData({...data, invoice_no: e.target.value})}
                                    />
                                ) : (
                                    <p>
                                        {invoice_no ? (
                                            invoice_no
                                        ) : (
                                            <span className='text-danger'>(invoice number not set)</span>
                                        )}
                                    </p>
                                )}
                            </Col>
                        </Row>
                        {data.to ? (
                            <>
                                <OrganizationDataViewer organizationData={data.to} dataOnly={true} addBillTo={true} />
                                {editing && !(originalInvoiceData && originalInvoiceData.from) && (
                                    <div className='align-self-end mb-3'>
                                        <Link className='btn btn-secondary' to={'/clients'}>
                                            Change
                                        </Link>{' '}
                                    </div>
                                )}
                            </>
                        ) : (
                            <NoOrganizationSelected destination='to' name='client' link='/clients' editing={editing} />
                        )}
                    </Col>
                    <Col xs={12}>
                        <div className='overflow-auto'>
                            <table className='table table-hover invoice-table'>
                                <thead>
                                    <tr>
                                        <th width='50%'>Description</th>
                                        <th width='15%'>Price</th>
                                        <th width='9%'>Quantity</th>
                                        <th width='15%'>Total</th>
                                        {editing && <th width='13%'>Edit</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.map((row, index) => (
                                        <InvoiceRow
                                            editable={editing}
                                            rowData={row}
                                            key={index}
                                            saveRowData={(rowData) => replaceRow(rowData, index)}
                                            deleteRow={() => deleteRow(index)}
                                        />
                                    ))}
                                    <tr>
                                        <td colSpan={4}>
                                            <div className='totalEntries'>
                                                <div className='d-flex flex-row align-items-center'>
                                                    <SubtotalNameEditor
                                                        editable={editing}
                                                        value={itemTotalName}
                                                        setValue={setItemTotalName}
                                                    />
                                                </div>
                                                <div>
                                                    <p>{rpDisplay(processTotalEntries(entries))}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {editing && (
                                            <td>
                                                <div className='totalEntries justify-content-end'>
                                                    <Button className='py-1 px-2' onClick={addRow}>
                                                        <FontAwesomeIcon icon={faPlus} /> Entries
                                                    </Button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </Col>
                    <Col xs={12} md={6}>
                        <Remarks editable={editing} value={remarks} saveValue={saveRemarks} />
                    </Col>
                    <Col xs={12} md={6}>
                        <Totals
                            editable={editing}
                            startName={itemTotalName}
                            entries={entries}
                            totalAdjustments={totalAdjustments}
                            saveTotalAdjustments={saveTotalAdjustments}
                        />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

const SubtotalNameEditor = ({editable, value, setValue}) => {
    const [subtotalName, setSubtotalName] = useState(value);
    const [editing, setEditing] = useState(false);
    useEffect(() => {
        setEditing(false);
        setSubtotalName(value);
    }, [value, editable]);
    const saveEdit = () => {
        setValue(subtotalName);
        setEditing(false);
    };
    const cancelEdit = () => {
        setSubtotalName(value);
        setEditing(false);
    };
    if (editing)
        return (
            <>
                <Button variant='danger' className='px-2 py-1 mr-2' onClick={cancelEdit}>
                    <FontAwesomeIcon icon={faTimes} />
                </Button>
                <Button variant='success' className='px-2 py-1 mr-2' onClick={saveEdit}>
                    <FontAwesomeIcon icon={faCheckCircle} />
                </Button>
                <input
                    className='form-control mb-0'
                    value={subtotalName}
                    onChange={(e) => setSubtotalName(e.target.value)}
                />
            </>
        );
    return (
        <>
            {editable && (
                <Button className='px-2 py-1 mr-2' onClick={() => setEditing(true)}>
                    <FontAwesomeIcon icon={faEdit} />
                </Button>
            )}
            <p className='font-weight-bold py-1'>{subtotalName}</p>
        </>
    );
};

const processTotalValue = ({originalValue, originalName, actions}) =>
    actions.reduce(
        (sum, curr) => {
            let {value} = sum[sum.length - 1];
            let {name, resultName, action, actionValue} = curr;
            if (action === 'chain') {
                let groupActionValues = actionValue.map((chainAction) => ({
                    diff: actionProcessor[chainAction.action](value, chainAction.actionValue).diff,
                    action: chainAction.action,
                    actionValue: chainAction.actionValue,
                    name: chainAction.name,
                }));
                let resultValue = value + groupActionValues.reduce((sum, curr) => sum + curr.diff, 0);
                return [
                    ...sum,
                    {
                        action /* actionValue, name */,
                        resultName,
                        resultValue /* diff, */,
                        groupActionValues,
                        value: resultValue, // used for reduce processing
                    },
                ];
            }
            let {resultValue, diff} = actionProcessor[action](value, actionValue);
            return [
                ...sum,
                {
                    action,
                    actionValue,
                    name,
                    resultName,
                    resultValue,
                    diff,
                    value: resultValue, // used for reduce processing
                },
            ];
        },
        [{value: originalValue, description: originalName}]
    );

const InvoiceRow = ({editable, rowData, saveRowData, deleteRow}) => {
    const [data, setData] = useState(rowData);
    const [editing, setEditing] = useState(false);
    const cancelEdit = () => {
        setData(rowData);
        setEditing(false);
    };
    const saveEdit = () => {
        saveRowData(data);
        setEditing(false);
    };
    useEffect(() => setData(rowData), [rowData, editable]);
    return (
        <tr>
            <td>
                <DescriptionDisplay
                    editing={editable && editing}
                    text={data.description}
                    changeText={(text) => setData({...data, description: text.target.value})}
                />
            </td>
            <td align='right'>
                <NumberDisplay
                    editing={editable && editing}
                    formatter={rpDisplay}
                    number={data.price}
                    changeNumber={(number) => setData({...data, price: number})}
                />
            </td>
            <td align='right'>
                <NumberDisplay
                    editing={editable && editing}
                    formatter={intDisplay}
                    number={data.quantity}
                    changeNumber={(number) => setData({...data, quantity: number})}
                />
            </td>
            <td align='right'>
                <NumberDisplay editing={false} formatter={rpDisplay} number={data.quantity * data.price} />
            </td>
            {editable && (
                <td>
                    {editable && editing ? (
                        <>
                            <Button variant='danger' className='px-2 py-1 mr-2' onClick={cancelEdit}>
                                <FontAwesomeIcon icon={faTimes} />
                            </Button>
                            <Button variant='success' className='px-2 py-1' onClick={saveEdit}>
                                <FontAwesomeIcon icon={faCheckCircle} />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant='danger' className='px-2 py-1 mr-2' onClick={() => deleteRow()}>
                                <FontAwesomeIcon icon={faTrash} />
                            </Button>
                            <Button variant='primary' className='px-2 py-1' onClick={() => setEditing(true)}>
                                <FontAwesomeIcon icon={faEdit} />
                            </Button>
                        </>
                    )}
                </td>
            )}
        </tr>
    );
};
const DescriptionDisplay = ({editing, text, changeText}) =>
    editing ? (
        <textarea rows={3} className='form-control' value={text} onChange={changeText} />
    ) : (
        <p>
            <span key={'i'} className='font-weight-bold'>
                {text.split('\n')[0]}
            </span>
            {text.split('\n').length > 1 &&
                text
                    .split('\n')
                    .slice(1)
                    .map((r, i) => (
                        <>
                            <br key={`b_${i}`} />
                            <span key={i}>{r}</span>
                        </>
                    ))}
        </p>
    );
const NumberDisplay = ({editing, formatter, number, changeNumber}) => {
    const [text, setText] = React.useState(formatter(number));
    const reportNumber = (_) => {
        const number = extractNumber(text);
        changeNumber(number);
        setText(formatter(number));
    };
    const changeHandler = (e) => setText(e.target.value);
    if (editing) return <input className='form-control' value={text} onChange={changeHandler} onBlur={reportNumber} />;
    return formatter(number);
};

const Remarks = ({editable, value, saveValue}) => {
    const [markdown, setMarkdown] = useState(value);
    const [selectedTab, setSelectedTab] = useState('write');
    const [editing, setEditing] = useState(false);
    const cancelEdit = () => {
        setMarkdown(value);
        setEditing(false);
    };
    const saveEdit = () => {
        saveValue(markdown);
        setEditing(false);
    };
    useEffect(() => setMarkdown(value), [editable, value]);
    return (
        <div className='remarks'>
            {editable && (
                <div className='d-flex flex-row align-items-center justify-content-between'>
                    <p className='font-weight-bold mb-0 h4'>Side Remarks</p>
                    <div className='d-flex flex-row'>
                        {editing ? (
                            <>
                                <Button variant='danger' className='px-2 py-1 ml-2' onClick={cancelEdit}>
                                    <FontAwesomeIcon icon={faTimes} />
                                </Button>
                                <Button variant='success' className='px-2 py-1 ml-2' onClick={saveEdit}>
                                    <FontAwesomeIcon icon={faCheckCircle} />
                                </Button>
                            </>
                        ) : (
                            <Button variant='primary' className='px-2 py-1 ml-4' onClick={() => setEditing(true)}>
                                <FontAwesomeIcon icon={faEdit} />
                            </Button>
                        )}
                    </div>
                </div>
            )}
            {editing ? (
                <ReactMde
                    value={markdown}
                    onChange={setMarkdown}
                    selectedTab={selectedTab}
                    onTabChange={setSelectedTab}
                    generateMarkdownPreview={(markdown) => Promise.resolve(<ReactMarkdown source={markdown} />)}
                />
            ) : (
                <ReactMarkdown source={markdown} />
            )}
        </div>
    );
};

const Totals = ({editable, startName, entries, totalAdjustments, saveTotalAdjustments}) => {
    const [editing, setEditing] = useState(false);
    const [adjustments, setAdjustments] = useState(totalAdjustments);
    const [processedActions, setProcessedActions] = useState([]);
    const cancelEdit = () => {
        setAdjustments(totalAdjustments);
        setEditing(false);
    };
    const saveEdit = () => {
        saveTotalAdjustments(adjustments);
        setEditing(false);
    };
    const replaceRow = (data, i) => {
        let newAdjustments = [...adjustments];
        console.log(data);
        newAdjustments.splice(i, 1, data);
        setAdjustments(newAdjustments);
    };
    const deleteRow = (i) => {
        let newAdjustments = [...adjustments];
        newAdjustments.splice(i, 1);
        setAdjustments(newAdjustments);
    };
    const addRow = () => {
        let templateRow = {action: 'round', actionValue: -3, name: 'Rounding', resultName: 'Rounded Value'};
        let newAdjustments = [...adjustments];
        newAdjustments.push(templateRow);
        setAdjustments(newAdjustments);
    };
    useEffect(() => {
        setAdjustments(totalAdjustments);
        setEditing(false);
    }, [totalAdjustments, editable]);
    useEffect(() => {
        try {
            let processedTotalValue = processTotalValue({
                originalValue: processTotalEntries(entries),
                originalName: startName,
                actions: adjustments,
            });
            setProcessedActions(processedTotalValue);
        } catch (e) {
            console.log(e);
        }
    }, [entries, startName, adjustments]);
    const actionsMapper = (action, index) => (
        <TotalRowEditor
            key={index}
            value={action}
            changeValue={(value) => replaceRow(value, index)}
            deleteRow={() => deleteRow(index)}
        />
    );

    return (
        <div className='totalEntriesContainer'>
            {editable && (
                <>
                    <div className='d-flex flex-row align-items-center justify-content-between'>
                        <p className='font-weight-bold mb-0 h4'>Totalling Adjustments</p>
                        <div className='d-flex flex-row'>
                            {editing ? (
                                <>
                                    <Button variant='danger' className='px-2 py-1 ml-2' onClick={cancelEdit}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </Button>
                                    <Button variant='success' className='px-2 py-1 ml-2' onClick={saveEdit}>
                                        <FontAwesomeIcon icon={faCheckCircle} />
                                    </Button>
                                    <Button variant='primary' className='px-2 py-1 ml-2' onClick={addRow}>
                                        <FontAwesomeIcon icon={faPlus} />
                                    </Button>
                                </>
                            ) : (
                                <Button variant='primary' className='px-2 py-1 ml-4' onClick={() => setEditing(true)}>
                                    <FontAwesomeIcon icon={faEdit} />
                                </Button>
                            )}
                        </div>
                    </div>
                </>
            )}
            {editing && adjustments.map(actionsMapper)}
            {processedActions.map((row, index) => (
                <TotalRow key={index} value={row} editable={editing} />
            ))}
        </div>
    );
};

const TotalRow = ({value}) => {
    if (value.groupActionValues) {
        return (
            <>
                {value.groupActionValues.map((row, index) => (
                    <>
                        <TotalRowValueDisplay
                            key={index}
                            value={{
                                description: row.name,
                                value: row.diff,
                            }}
                        />
                    </>
                ))}
                <TotalRowValueDisplay
                    value={{
                        description: value.resultName,
                        value: value.resultValue,
                        separateBefore: true,
                    }}
                />
            </>
        );
    }
    if (value.actionValue)
        return (
            <>
                <TotalRowValueDisplay
                    value={{
                        description: value.name,
                        value: value.diff,
                    }}
                />
                <TotalRowValueDisplay
                    value={{
                        description: value.resultName,
                        value: value.resultValue,
                        separateBefore: true,
                    }}
                />
            </>
        );
    return <TotalRowValueDisplay value={{...value, first: true}} />;
};

const TotalRowValueDisplay = ({value}) => (
    <div className='totalEntries'>
        <div>
            <p className={value.separateBefore || value.first ? 'font-weight-bold' : null}>{value.description}</p>
        </div>
        <div className={`${value.separateBefore ? 'separateBefore' : null} ${value.first && 'font-weight-bold'}`}>
            <p>{rpDisplay(value.value)}</p>
        </div>
    </div>
);

const TotalRowEditor = ({value, changeValue, isChain, deleteRow}) => {
    const changeActionType = (e) => {
        let {value: newValue} = e.target;
        if (newValue === 'chain') {
            const defaultStarterArray = [{action: 'round', actionValue: -3}];
            return changeValue({...value, actionValue: defaultStarterArray, action: newValue});
        }
        changeValue({...value, action: newValue});
    };
    const changeName = (e) => {
        let {value: newValue} = e.target;
        changeValue({...value, name: newValue});
    };
    const changeResultName = (e) => {
        let {value: newValue} = e.target;
        changeValue({...value, resultName: newValue});
    };
    const changeActionValue = (e) => {
        let {value: newValue} = e.target;
        if (Number.isNaN(Number(newValue))) return;
        value.action !== 'chain' && changeValue({...value, actionValue: Number(newValue)});
    };
    const addSubrow = () => {
        const templateRow = {name: 'New', action: 'round', actionValue: -3};
        let newActionValue = [...value.actionValue];
        newActionValue.push(templateRow);
        changeValue({...value, actionValue: newActionValue});
    };
    const deleteSubrow = (row) => {
        let newActionValue = [...value.actionValue];
        newActionValue.splice(row, 1);
        changeValue({...value, actionValue: newActionValue});
    };
    const changeSubrow = (data, row) => {
        let newActionValue = [...value.actionValue];
        newActionValue.splice(row, 1, data);
        changeValue({...value, actionValue: newActionValue});
    };
    return (
        <div className={`totalEntries editor flex-column ${isChain ? 'w-auto ml-4' : ''}`}>
            <div className='d-flex flex-row w-100 align-items-center'>
                <div className='form-group w-100'>
                    <label>Step Name</label>
                    <input
                        className='form-control w-100'
                        value={value.name}
                        onChange={changeName}
                        readOnly={value.action === 'chain'}
                    />
                </div>

                <div className='ml-4'>
                    <Button variant='danger' className='px-2 py-1' onClick={() => deleteRow()}>
                        <FontAwesomeIcon icon={faTrash} />
                    </Button>
                </div>
            </div>
            <div className='row'>
                <div className={`col-6 form-group`}>
                    <label>Type</label>
                    <select className='form-control' value={value.action} onChange={changeActionType}>
                        {Object.keys(actionProcessor)
                            .filter((r) => !isChain || r !== 'chain')
                            .map((r) => (
                                <option value={r}>{r}</option>
                            ))}
                    </select>
                </div>
                {
                    <div className='col-6 form-group'>
                        <label>Value</label>
                        <div className='d-flex flex-row'>
                            <input
                                type='number'
                                onChange={changeActionValue}
                                value={value.actionValue}
                                className='form-control mw-100 mb-0'
                                readOnly={value.action === 'chain'}
                            />
                            {value.action === 'chain' && (
                                <Button variant='primary' className='px-2 py-1 ml-4' onClick={addSubrow}>
                                    <FontAwesomeIcon icon={faPlus} />
                                </Button>
                            )}
                        </div>
                    </div>
                }
            </div>
            {value.action === 'chain' && (
                <>
                    <p>Substeps</p>
                    {value.actionValue.map((subAction, index) => (
                        <TotalRowEditor
                            value={subAction}
                            isChain={true}
                            deleteRow={() => deleteSubrow(index)}
                            changeValue={(data) => changeSubrow(data, index)}
                        />
                    ))}
                </>
            )}
            {!isChain && (
                <div className='form-group w-100'>
                    <label>Result Name</label>
                    <input className='form-control w-100' value={value.resultName} onChange={changeResultName} />
                </div>
            )}
        </div>
    );
};

export default InvoiceEditor;
