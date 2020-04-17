import React from 'react'
import {Link} from '@reach/router';
import {Container, Navbar, Nav} from 'react-bootstrap'

import {useAuthentication} from './LoginLogout'
import useFirebase from '../firebase'

const NavMenu = () => {
    const session = useAuthentication();
    const firebase = useFirebase();
    const loggedIn = !!session
    const menuItems = [
        {
            link: '/organizations',
            text: `Organizations`,
            restrict: true,
        },
        {
            link: '/clients',
            text: `Clients`,
            restrict: true,
        },
        {
            link: '/invoices',
            text: `Invoices`,
            restrict: true,
        },
    ];
    const menuItemIsActive = ({isCurrent}) => (isCurrent ? {className: 'nav-link active'} : {});
    const menuItemsFilter = (item) => !item.restrict || loggedIn;
    const menuItemsMap = (item) => (
        <Nav.Link key={item.link} as={Link} getProps={menuItemIsActive} to={item.link}>
            {item.text}
        </Nav.Link>
    );
    return (
        <div className='bg-dark'>
            <Container fluid='lg'>
                <Navbar expand='md' sticky='top' variant='dark' className='px-0 justify-content-between'>
                    <Navbar.Brand as={Link} to='/' className='p-0 d-flex flex-row align-items-center mr-auto'>
                        <img src='/enceleratelogo.svg' alt='' className='p-0' style={{height: 40}} />
                        <span className='d-none d-lg-block'>invoice</span>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls='responsive-navbar-nav' />
                    <Navbar.Collapse id='responsive-navbar-nav' className='flex-grow-0'>
                        <Nav>
                            {menuItems.filter(menuItemsFilter).map(menuItemsMap)}
                            {!!session && <Nav.Link onClick={() => firebase.signOut()}>Sign Out</Nav.Link>}
                            {!session && (
                                <Nav.Link as={Link} to='/organizations'>
                                    Sign In
                                </Nav.Link>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
            </Container>
        </div>
    );
};

export default NavMenu