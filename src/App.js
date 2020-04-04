import React, {useEffect} from 'react';
import './App.scss';
import useFirebase from './firebase';
import {useDispatch, actions} from './redux';
import {Router, Link} from '@reach/router';
import {Navbar, Nav, Container} from 'react-bootstrap';

import NeedLogin, {useAuthentication, useAuthenticateRole} from './LoginLogout';

const AdminRoute = () => {
    const isAdmin = useAuthenticateRole('admin');
    return (
        <NeedLogin>
            <NavMenu />
            {isAdmin ? (
                <Container><h1>Welcome, only admin can access this route</h1></Container>
            ) : (
                <h1 className='text-danger'>Hey, you're not admin, you can't access this route!</h1>
            )}
        </NeedLogin>
    );
};
const UserRoute = () => (
    <NeedLogin>
        <NavMenu />
        <Container><h1>Welcome, only logged in users can access this route</h1></Container>
    </NeedLogin>
);

const HomeRoute = () => (
    <div>
        <NavMenu />
        <Container><h1>Welcome, this homescreen can be accessed by anyone.</h1></Container>
    </div>
);

const NavMenu = () => {
    const session = useAuthentication();
    const firebase = useFirebase();
    const currentRole =
        session && session.data && session.data.role && session.data.role.length ? session.data.role : [];
    const menuItems = [
        {
            link: '/admin',
            text: `Admin's Menu`,
            restrict: 'admin',
        },
        {
            link: '/user',
            text: `Users' menu`,
            restrict: 'user',
        },
        {
            link: '/',
            text: `Anyone's menu`,
            restrict: null,
        },
    ];
    const menuItemIsActive = ({isCurrent}) => (isCurrent ? {className: 'nav-link active'} : {});
    const menuItemsFilter = (item) => !item.restrict || currentRole.includes(item.restrict);
    const menuItemsMap = (item) => (
        <Nav.Link key={item.link} as={Link} getProps={menuItemIsActive} to={item.link}>
            {item.text}
        </Nav.Link>
    );
    return (
        <Navbar expand='md' sticky='top' bg='dark' variant='dark'>
            <Container fluid='lg'>
                <Navbar.Brand as={Link} to='/' className='p-0'>
                  <img src='/enceleratelogo.svg' alt='' className='p-0' style={{height: 40}} />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls='basic-navbar-nav' />
                <Navbar.Collapse id='basic-navbar-nav'>
                    <Nav className='ml-auto'>
                        {menuItems.filter(menuItemsFilter).map(menuItemsMap)}
                        {!!session && <Nav.Link onClick={() => firebase.signOut()}>Sign Out</Nav.Link>}
                        {!session && (
                            <Nav.Link as={Link} to='/user'>
                                Sign In
                            </Nav.Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

const App = () => {
    const firebase = useFirebase();
    const dispatch = useDispatch();
    useEffect(
        () =>
            firebase.authStateListener(
                (authUser) => dispatch({type: actions.AUTH_USER_SET, authUser}),
                () => dispatch({type: actions.AUTH_USER_SET})
            ),
        [firebase, dispatch]
    );
    return (
        <Router>
            <HomeRoute path='/' />
            <UserRoute path='/user' />
            <AdminRoute path='/admin' />
        </Router>
    );
};

export default App;
