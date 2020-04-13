import React from 'react';
import {useShallowSelector, actions, useDispatch} from '../../redux';
import {Link, navigate} from '@reach/router';

import 'react-dropzone-uploader/dist/styles.css';

import {Container, Row, Col, Nav} from 'react-bootstrap';

const OrganizationList = () => {
    const dispatch = useDispatch();
    const organizationList = useShallowSelector(state => state.organizations);
    const session = useShallowSelector(state => state.session);
    const activeOrganization = useShallowSelector(state => state.activeOrganization);
    const activeId =
        activeOrganization && activeOrganization.from && activeOrganization.from.id ? activeOrganization.from.id : null;
    const manageInvoice = id => {
        const organizationData = organizationList.find(o => o.id === id);
        dispatch({type: actions.ACTIVE_ORGANIZATION_SET, payload: {from: organizationData}});
    };
    return (
        <Container>
            <Row>
                <Col>
                    <Nav variant='tabs my-3'>
                        <Nav.Item>
                            <Nav.Link active>Organization List</Nav.Link>
                        </Nav.Item>
                        <Nav.Item className='ml-auto'>
                            <Nav.Link className='btn btn-outline-primary' as={Link} to='/organizations/create'>
                                Create New
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Col>
            </Row>
            <Row>
                <Col className='overflow-auto'>
                    <div className='overflow-auto'>
                        {!organizationList ? (
                            <h1 className='text-center my-5'>Fetching organization list</h1>
                        ) : organizationList.length ? (
                            <OrganizationListTable
                                organizations={organizationList}
                                activeEmail={session.email}
                                manageInvoice={manageInvoice}
                                activeId={activeId}
                            />
                        ) : (
                            <>
                                <h1 className='my-5'>You have no organizations.</h1>
                                <button className='btn btn-primary' onClick={() => navigate('/organizations/create')}>
                                    Create Organization
                                </button>
                            </>
                        )}
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

const OrganizationListTable = ({organizations, activeEmail, manageInvoice, activeId}) => (
    <table className='table table-hover'>
        <thead>
            <tr>
                <th width='75%'>Organization</th>
                <th width='25%' className='text-right'>
                    Actions
                </th>
            </tr>
        </thead>
        <tbody>
            {organizations.map((organization, index) => (
                <tr key={index}>
                    <td className='align-middle'>
                        <div className='d-flex flex-row align-items-center' style={{height: 100}}>
                            <div className='previewLogoSq' style={{width: 100}}>
                                <img src={organization.logoUrl} alt='Orgranization Logo' />
                            </div>
                            <p className='h4 mb-0 ml-3'>{organization.name}</p>
                        </div>
                    </td>
                    <td className='align-middle'>
                        <div className='d-flex flex-row'>
                            <Link to={`/organizations/manage/${organization.id}`} className='btn btn-secondary ml-auto'>
                                {organization.superadmins.includes(activeEmail) ? 'Manage' : 'View'}
                            </Link>
                            <button
                                className={`btn ml-2 ${organization.id === activeId ? 'btn-warning' : 'btn-primary'}`}
                                onClick={() => manageInvoice(organization.id)}
                            >
                                {organization.admins.includes(activeEmail) ? 'Manage Invoices' : 'View Invoices'}
                            </button>
                        </div>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
);

export default OrganizationList;
