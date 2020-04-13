import React from 'react';
import {Container, Row, Col} from 'react-bootstrap';
import {Link} from '@reach/router';

const Home = () => (
    <Container className='mt-3'>
        <Row>
            <Col>
                <h1>Welcome to Encelerate Invoice!</h1>

                <h2>This is an amazing way to do invoice.</h2>

                <p>
                    Different from conventional spreadsheets and accounting application, this invoicing application
                    creates the ability for both issuer and payer to see exactly the same invoice data online.
                </p>

                <p>Below are some steps to get started:</p>

                <ol>
                    <li>Sign in</li>
                    <li>Create an organization from which to create an invoice</li>
                    <li>Search for client organization by email address </li>
                    <li>
                        If the email address has no organization yet, another organization can be created to represent
                        the payer's organization, where the contact person's email address can be included as member
                        administrator
                    </li>
                    <li>
                        Create invoice by setting active organization to send from (organizations menu) and send to
                        (clients menu)
                    </li>
                    <li>
                        All created invoices is automatically stored by organizations, with each invoice status can be
                        tracked in the list.
                    </li>
                </ol>

                <p>
                    Even without existing account, we can create destination organizations with preassigned users email
                    address to let them easily log in and track their invoices
                </p>

                <h3>
                    So, maybe, begin with <Link to='organizations'>Signing in?</Link>
                </h3>
            </Col>
        </Row>
    </Container>
);

export default Home;
