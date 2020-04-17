import React, {useEffect, useState} from 'react';
import {useShallowSelector, actions, useDispatch} from '../../redux';
import {v4 as uuidV4} from 'uuid';
import useFirebase from '../../firebase';
import * as yup from 'yup';

import 'react-dropzone-uploader/dist/styles.css';
import Dropzone from 'react-dropzone-uploader';

import {Container, Row, Col, Nav} from 'react-bootstrap';
import {Button} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTrash, faPlus} from '@fortawesome/free-solid-svg-icons';

import {navigate} from '@reach/router';

const seedData = {
    name: 'Your Organization Name',
    detail: [
        {
            field: 'Phone',
            value: '+62 21 123 4567'
        },
        {
            field: 'Address',
            value: `Amazing Street No. 1, Awesome Boulevard
Jakarta 12345`
        }
    ]
};

const OrganizationDisplay = ({organizationId}) => {
    const firebase = useFirebase();
    const dispatch = useDispatch();
    const session = useShallowSelector(state => state.session);
    const organizationDataSnapshot = useShallowSelector(
        state => state.organizations && state.organizations.find(organization => organization.id === organizationId)
    );
    const [organizationData, setOrganizationData] = useState(
        organizationDataSnapshot ? organizationDataSnapshot : seedData
    );
    const [editing, setEditing] = useState(false);
    const [uuid, setUuid] = useState(organizationId ? organizationId : uuidV4());
    const [logoFile, setLogoFile] = useState(null);
    const logoImg = organizationData.logoUrl
        ? organizationData.logoUrl
        : logoFile && logoFile.meta
        ? logoFile.meta.previewUrl
        : null;
    const editable =
        !organizationId || (organizationDataSnapshot && organizationDataSnapshot.superadmins.includes(session.email));
    useEffect(() => {
        if (!organizationDataSnapshot) return;
        setOrganizationData(organizationDataSnapshot);
        setUuid(organizationId);
    }, [organizationId, organizationDataSnapshot]);
    const doImageUpload = () =>
        new Promise((resolve, reject) => {
            if (!logoFile) return;
            const {file, meta} = logoFile;
            const filename = `logo/${uuid}/${new Date()
                .getTime()
                .toString()
                .slice(3)}.${meta.type.split('/')[1]}`;
            const storage = firebase.storage.child(filename);
            const uploadTask = storage.put(file);
            uploadTask.on(
                'state_changed',
                () => {},
                error => {
                    console.log(error);
                    reject(error);
                },
                () => {
                    resolve(`http://${process.env.REACT_APP_IMAGE_FILES_DOMAIN}/${filename}`);
                }
            );
        });
    const submitOrganization = async () => {
        if (!organizationData.logoUrl && !logoFile) {
            dispatch({
                type: actions.MASKDIV_SET,
                payload: {
                    dismissable: true,
                    showSpinner: false,
                    title: 'No Logo Specified',
                    message: 'Please submit logo before submitting'
                }
            });
            return;
        }
        try {
            dispatch({
                type: actions.MASKDIV_SET,
                payload: {dismissable: false, showSpinner: true, title: 'Submitting Data'}
            });
            const newLogoUrl = logoFile ? await doImageUpload() : organizationData.logoUrl;
            const setData = await firebase.db
                .collection('organizations')
                .doc(uuid)
                .set(
                    {
                        ...organizationData,
                        logoUrl: newLogoUrl,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    },
                    {merge: true}
                );
            dispatch({
                type: actions.MASKDIV_SET,
                payload: false
            });
            navigate('/organizations');
            return setData;
        } catch (e) {
            dispatch({
                type: actions.MASKDIV_SET,
                payload: {
                    dismissable: true,
                    showSpinner: false,
                    title: 'An Error Occured Creating Your Organization',
                    message: JSON.stringify(e)
                }
            });
        }
    };
    const setLogo = logo => {
        if (!logo) {
            setLogoFile(logo);
            if (organizationData.logoUrl) {
                const newOrganizationData = {...organizationData};
                delete newOrganizationData.logoUrl;
                setOrganizationData(newOrganizationData);
            }
        }
        setLogoFile(logo);
    };
    return (
        <Container>
            {organizationId && !organizationDataSnapshot ? (
                <Row>
                    <Col>
                        <h1 className={'text-center'}>Fetching Organizations Data</h1>
                    </Col>
                </Row>
            ) : (
                <Row>
                    <Col xs={12}>
                        <Nav variant='tabs my-3'>
                            <Nav.Item>
                                <Nav.Link active={!editing} onClick={() => setEditing(false)}>
                                    View
                                </Nav.Link>
                            </Nav.Item>
                            {editable && (
                                <>
                                    <Nav.Item>
                                        <Nav.Link active={editing} onClick={() => setEditing(true)}>
                                            Edit
                                        </Nav.Link>
                                    </Nav.Item>

                                    <Nav.Item className='ml-auto'>
                                        {organizationId ? (
                                            <Nav.Link
                                                disabled={
                                                    (organizationDataSnapshot &&
                                                        organizationDataSnapshot === organizationData) ||
                                                    !(organizationData.logoUrl || (logoFile && logoFile.meta))
                                                }
                                                className='btn btn-outline-primary'
                                                onClick={submitOrganization}
                                            >
                                                Update
                                            </Nav.Link>
                                        ) : (
                                            <Nav.Link
                                                disabled={!(logoFile && logoFile.meta)}
                                                className='btn btn-outline-primary'
                                                onClick={submitOrganization}
                                            >
                                                Create
                                            </Nav.Link>
                                        )}
                                    </Nav.Item>
                                    {organizationId && (
                                        <Nav.Item>
                                            <Nav.Link
                                                className='btn btn-outline-secondary'
                                                onClick={() => setOrganizationData(organizationDataSnapshot)}
                                            >
                                                Reset
                                            </Nav.Link>
                                        </Nav.Item>
                                    )}
                                </>
                            )}
                            <Nav.Item className={`${!editable && 'ml-auto'}`}>
                                <Nav.Link
                                    className='btn btn-outline-secondary'
                                    onClick={() => navigate('/organizations')}
                                >
                                    Back to List
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Col>
                    <Col md={6}>
                        {!editing ? (
                            <OrganizationDataViewer logoImg={logoImg} organizationData={organizationData} />
                        ) : (
                            <OrganizationDataEditor
                                logoImg={logoImg}
                                setLogoFile={setLogo}
                                organizationData={organizationData}
                                setOrganizationData={setOrganizationData}
                            />
                        )}
                    </Col>
                    <Col md={6}>
                        <OrganizationMemberEditor
                            editable={editing}
                            organizationData={organizationData}
                            setOrganizationData={setOrganizationData}
                        />
                    </Col>
                </Row>
            )}
        </Container>
    );
};

const OrganizationDataEditor = ({logoImg, setLogoFile, organizationData, setOrganizationData}) => {
    const {name, detail} = organizationData;
    const changeOrganizationName = e => {
        let newData = {...organizationData, name: e.target.value};
        setOrganizationData(newData);
    };
    const changeOrganizationDetail = (e, index, isField) => {
        let newData = {...organizationData};
        let newDetail = newData.detail;
        let currentRow = newDetail[index];
        currentRow[isField ? 'field' : 'value'] = e.target.value;
        newDetail.splice(index, 1, currentRow);
        newData.detail = newDetail;
        setOrganizationData(newData);
    };
    const deleteOrganizationDetail = index => {
        let newData = {...organizationData};
        let newDetail = newData.detail;
        newDetail.splice(index, 1);
        newData.detail = newDetail;
        setOrganizationData(newData);
    }
    const addOrganizationDetail = () => {
        let newData = {...organizationData};
        let newDetail = newData.detail;
        newDetail.push({field: '', value: ''});
        newData.detail = newDetail;
        setOrganizationData(newData);

    }
    return (
        <div>
            <h1 className='h3 mb-1 mt-2'>Logo</h1>
            {logoImg ? (
                <div className='d-flex flex-row justify-content-between align-items-center'>
                    <img className='previewLogoH mb-4' src={logoImg} alt='Organization logo' />
                    <Button variant='danger' className='px-2 py-1' onClick={() => setLogoFile(null)}>
                        <FontAwesomeIcon icon={faTrash} />
                    </Button>
                </div>
            ) : (
                <Dropzone
                    multiple={false}
                    canRemove={false}
                    classNames={{
                        dropzone: 'overflow-hidden d-flex flex-column rounded dz',
                        inputLabel:
                            'overflow-hidden d-flex flex-column h-100 text-primary align-items-center justify-content-center',
                        dropzoneReject: 'border-danger'
                    }}
                    maxSizeBytes={1024 * 150}
                    maxFiles={1}
                    accept='.png, .jpg, .jpeg'
                    inputContent={
                        <>
                            <p className='font-weight-bold mb-0'>
                                Drop your logo file here or
                                <span className='btn btn-sm btn-primary ml-3'>Select file</span>
                            </p>
                            <p className='mb-0'>
                                Accepted files: <code>.jpeg, .jpg, .png</code>
                            </p>
                        </>
                    }
                    onChangeStatus={f => {
                        f.meta.status === 'done' && setLogoFile(f);
                    }}
                />
            )}
            <h3 className='h3 mb-1 mt-2'>Company Name</h3>
            <input className='form-control' value={name} onChange={changeOrganizationName} />
            <h3 className='h3 mb-1 mt-2'>Company Detail</h3>
            <dl className='d-flex flex-row flex-wrap'>
                {detail &&
                    detail.length > 0 &&
                    detail.map((row, index) => (
                        <React.Fragment key={index}>
                            <dt className='w-25'>
                                <input
                                    className='form-control w-100 px-1'
                                    value={row.field}
                                    onChange={e => changeOrganizationDetail(e, index, true)}
                                />
                                <Button variant='danger' className='py-1 float-right mt-1'><FontAwesomeIcon icon={faTrash} onClick={() => deleteOrganizationDetail(index)}/></Button>
                            </dt>
                            <dd className='w-75 pl-2'>
                                <textarea
                                    className='form-control w-100 px-1'
                                    value={row.value}
                                    onChange={e => changeOrganizationDetail(e, index)}
                                    rows={4}
                                />
                            </dd>
                        </React.Fragment>
                    ))}
            </dl>
            <Button variant='primary' className='float-right py-1' onClick={addOrganizationDetail}><FontAwesomeIcon icon={faPlus}/></Button>
        </div>
    );
};
export const OrganizationDataViewer = ({logoImg, organizationData, dataOnly = false, addBillTo}) => {
    const {name, detail} = organizationData;
    return (
        <div>
            {!dataOnly && logoImg ? (
                <img className='previewLogoH mb-4' src={logoImg} alt='Organization logo' />
            ) : (
                !dataOnly && (
                    <div>
                        <h3 className='h3 text-danger'>No Logo Image</h3>
                    </div>
                )
            )}
            <h1 className='h3 mb-1 mt-2'>
                {addBillTo && 'Bill To: '}
                {name}
            </h1>
            <dl className='d-flex flex-row flex-wrap'>
                {detail.map(row => (
                    <>
                        <dt className='w-25'>{row.field}</dt>
                        <dd className='w-75 pl-2'>{row.value}</dd>
                    </>
                ))}
            </dl>
        </div>
    );
};

const OrganizationMemberEditor = ({editable, organizationData, setOrganizationData}) => {
    const session = useShallowSelector(state => state.session);
    const email = session && session.email ? session.email : null;
    const emailToObject = email => ({email: email});
    const objectEmailToObjectInherited = row => ({email: row.email, inherited: true});
    const sortFilter = data =>
        data
            .filter((r, i, a) => {
                let idx = a.findIndex(ar => ar.email === r.email);
                return idx === i;
            })
            .sort((prev, next) => (prev.email < next.email ? -1 : prev.email > next.email ? 1 : 0));
    const sortFilterRaw = data =>
        data.filter((r, i, a) => a.indexOf(r) === i).sort((prev, next) => (prev < next ? -1 : prev > next ? 1 : 0));

    const {superadmins: superadminsRaw, admins: adminsRaw, members: membersRaw} = organizationData;
    const superadmins = superadminsRaw && superadminsRaw.length ? sortFilter(superadminsRaw.map(emailToObject)) : [];
    const admins =
        adminsRaw && adminsRaw.length
            ? sortFilter([...adminsRaw.map(emailToObject), ...superadmins.map(objectEmailToObjectInherited)])
            : [];
    const members =
        membersRaw && membersRaw.length
            ? sortFilter([...membersRaw.map(emailToObject), ...admins.map(objectEmailToObjectInherited)])
            : [];
    useEffect(() => {
        if (!(superadminsRaw && superadminsRaw.length)) {
            setOrganizationData({...organizationData, superadmins: [email], admins: [email], members: [email]});
        }
    });
    const changeMemberData = (type, data) => {
        const newOrganizationData = {
            superadmins: organizationData.superadmins,
            members: organizationData.members,
            admins: organizationData.admins
        };
        newOrganizationData[type] = sortFilterRaw(data);
        newOrganizationData.admins = sortFilterRaw([...newOrganizationData.superadmins, ...newOrganizationData.admins]);
        newOrganizationData.members = sortFilterRaw([...newOrganizationData.admins, ...newOrganizationData.members]);

        setOrganizationData({...organizationData, ...newOrganizationData});
    };
    return (
        <div>
            <h1 className='h3 mb-1 mt-2'>Organization Members</h1>
            {superadmins && superadmins.length && (
                <OrganizationMemberDisplayer
                    editable={editable}
                    data={superadmins}
                    setData={data => changeMemberData('superadmins', data)}
                    addData={email => changeMemberData('superadmins', [...superadminsRaw, email])}
                    memberType={'Administrator'}
                />
            )}
            {admins && admins.length && (
                <OrganizationMemberDisplayer
                    editable={editable}
                    data={admins}
                    setData={data => changeMemberData('admins', data)}
                    addData={email => changeMemberData('admins', [...adminsRaw, email])}
                    memberType={'Invoice Manager'}
                />
            )}
            {members && members.length && (
                <OrganizationMemberDisplayer
                    editable={editable}
                    data={members}
                    setData={data => changeMemberData('members', data)}
                    addData={email => changeMemberData('members', [...membersRaw, email])}
                    memberType={'Invoice Viewer'}
                />
            )}
        </div>
    );
};
const OrganizationMemberDisplayer = ({editable, data, setData, addData, memberType}) => {
    const yupSchema = React.useCallback(
        yup.object().shape({
            email: yup
                .string()
                .required()
                .email()
        }),
        []
    );
    const session = useShallowSelector(state => state.session);
    const email = session && session.email ? session.email : null;
    const [newMember, setNewMember] = useState('');
    const [validNewMember, setValidNewMember] = useState(null);
    const handleNewMemberChange = e => {
        const {value} = e.target;
        setNewMember(value);
        yupSchema
            .validate({email: value})
            .then(valid => setValidNewMember(valid))
            .catch(_ => {
                setValidNewMember(false);
            });
    };
    const deleteMember = i => {
        const newMembers = data.map(d => d.email);
        newMembers.splice(i, 1);
        setData(newMembers);
    };
    const addMember = () => {
        if (!validNewMember) return;
        addData(newMember);
        setNewMember('');
        setValidNewMember(null);
    };
    return (
        <div className='border border-primary border-rounded p-3 rounded mb-3'>
            <div>
                <p className='font-weight-bold'>{memberType}</p>
            </div>
            {data &&
                data.length &&
                data.map((member, index) => (
                    <div className='d-flex flex-row justify-content-between align-items-center my-3' key={index}>
                        <div>
                            <p className='py-1 mb-0'>{member.email}</p>
                        </div>
                        {editable && member.email !== email && !member.inherited ? (
                            <div>
                                <button className='btn btn-danger' onClick={() => deleteMember()}>
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        ) : null}
                    </div>
                ))}
            {editable && (
                <div className='d-flex flex-row justify-content-between align-items-center'>
                    <input
                        className={`form-control ${validNewMember === false && 'is-invalid'}`}
                        onChange={handleNewMemberChange}
                        value={newMember}
                        placeholder={'new@email.address'}
                    />
                    <button className='btn btn-primary ml-2' disabled={!validNewMember} onClick={() => addMember()}>
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrganizationDisplay;
