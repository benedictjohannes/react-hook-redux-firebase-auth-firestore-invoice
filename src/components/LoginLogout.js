import React, {useState} from 'react';
import useFirebase from '../firebase';
import {useDispatch, actions, useSelector} from '../redux';

import {Form} from 'react-bootstrap';
import {Formik} from 'formik';
import * as yup from 'yup';
import {Button} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faGooglePlus, faFacebookF} from '@fortawesome/free-brands-svg-icons';
import {faCheckCircle} from '@fortawesome/free-solid-svg-icons';

const SignUpForm = () => {
    const [error, setError] = useState(null);
    const firebase = useFirebase();
    const dispatch = useDispatch();
    const validationSchema = yup.object().shape({
        displayName: yup.string().required('* Please let us know your name'),
        email: yup
            .string()
            .email('* should be a valid email address')
            .max(100, '* should be less than 100 characters')
            .required('* email address is required'),
        pass1: yup
            .string()
            .min(8, '* should be at least 8 characters long')
            .required('* password cannot be empty'),
        pass2: yup
            .mixed()
            .required('* password cannot be empty')
            .oneOf([yup.ref('pass1')], '* passwords do not match'),
    });
    const signInGoogle = () =>
        firebase.signInWithGoogle().then((authUser) => {
            dispatch({type: actions.AUTH_USER_SET, payload: authUser});
        });
    const signInFacebook = () =>
        firebase.signInWithFacebook().then((authUser) => {
            dispatch({type: actions.AUTH_USER_SET, payload: authUser});
        });
    return (
        <div className='signInOutForm border-primary'>
            <h1 className='text-center mb-4'>Sign Up</h1>
            {error && <p className='text-danger'>error</p>}
            <Formik
                initialValues={{email: '', pass1: '', pass2: '', displayName: ''}}
                validationSchema={validationSchema}
                onSubmit={(values, {setSubmitting, resetForm}) => {
                    setSubmitting(true);
                    firebase
                        .createUserWithEmailAndPassword(values.email, values.pass1)
                        .then(() => firebase.auth.currentUser.updateProfile({displayName: values.displayName}))
                        .then(() => firebase.sendEmailVerification())
                        .then(() => dispatch({type: actions.AUTH_USER_SET, payload: firebase.auth.currentUser}))
                        .then(() => {
                            setSubmitting(false);
                            resetForm();
                        })
                        .catch((error) => {
                            setError(error.message ? error.message : error.code ? error.code : 'Sorry, an error occured')
                            setSubmitting(false)
                        });
                }}
            >
                {({values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting}) => (
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId='displayName'>
                            <Form.Label>Display Name</Form.Label>
                            <Form.Control
                                type='text'
                                name='displayName'
                                placeholder="Everybody's got a name"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.displayName}
                                className={touched.displayName && `${errors.displayName ? 'is-invalid' : 'is-valid'}`}
                            />
                            {touched.displayName && errors.displayName ? (
                                <div className='is-invalid'>{errors.displayName}</div>
                            ) : null}
                        </Form.Group>
                        <Form.Group controlId='email'>
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control
                                type='text'
                                name='email'
                                placeholder='Your Email Address'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.email}
                                className={touched.email && `${errors.email ? 'is-invalid' : 'is-valid'}`}
                            />
                            {touched.email && errors.email ? <div className='is-invalid'>{errors.email}</div> : null}
                        </Form.Group>
                        <Form.Group controlId='pass1'>
                            <Form.Label>Your Password</Form.Label>
                            <Form.Control
                                type='password'
                                name='pass1'
                                placeholder='Your Password'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.pass1}
                                className={touched.pass1 && `${errors.pass1 ? 'is-invalid' : 'is-valid'}`}
                            />
                            {touched.pass1 && errors.pass1 ? <div className='is-invalid'>{errors.pass1}</div> : null}
                        </Form.Group>
                        <Form.Group controlId='pass2'>
                            <Form.Label>Repeat Password</Form.Label>
                            <Form.Control
                                type='password'
                                name='pass2'
                                placeholder='Password, again'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.pass2}
                                className={touched.pass2 && `${errors.pass2 ? 'is-invalid' : 'is-valid'}`}
                            />
                            {touched.pass2 && errors.pass2 ? <div className='is-invalid'>{errors.pass2}</div> : null}
                        </Form.Group>
                        <div className='d-flex flex-row justify-content-between'>
                            <Button
                                variant='primary'
                                type='submit'
                                disabled={isSubmitting || Object.keys(errors).length}
                            >
                                Create Account
                            </Button>
                            <Button
                                variant='outline-info'
                                onClick={() => dispatch({type: actions.LOGIN_LOGOUT_PAGE_SET, payload: 'signIn'})}
                            >
                                Sign In
                            </Button>
                        </div>
                        <div className='d-flex flex-row h-100 mt-4 align-items-baseline justify-content-between'>
                            <p className='mb-0'>Or sign in with</p>
                            <div>
                                <Button variant='outline-primary p-1 px-2 h-100 mx-2' onClick={() => signInGoogle()}>
                                    <FontAwesomeIcon icon={faGooglePlus} className='h-100' size='lg' />
                                </Button>
                                <Button variant='outline-primary p-1 px-2 h-100' onClick={() => signInFacebook()}>
                                    <FontAwesomeIcon icon={faFacebookF} />
                                </Button>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};
const SignInForm = () => {
    const [error, setError] = useState(null);
    const firebase = useFirebase();
    const dispatch = useDispatch();
    const validationSchema = yup.object().shape({
        email: yup
            .string()
            .email('* should be a valid email address')
            .max(100, '* should be less than 100 characters')
            .required('* email address is required'),
        pass: yup
            .string()
            .required('* password cannot be empty'),
    });
    const signInGoogle = () =>
        firebase.signInWithGoogle().then((authUser) => {
            dispatch({type: actions.AUTH_USER_SET, payload: authUser});
        });
    const signInFacebook = () =>
        firebase.signInWithFacebook().then((authUser) => {
            dispatch({type: actions.AUTH_USER_SET, payload: authUser});
        });
    return (
        <div className='signInOutForm border-primary'>
            <h1 className='text-center mb-4'>Sign In</h1>
            {error && <p className='text-danger'>{error}</p>}
            <Formik
                initialValues={{email: '', pass: ''}}
                validationSchema={validationSchema}
                onSubmit={(values, {setSubmitting, resetForm}) => {
                    setSubmitting(true);
                    firebase
                        .signInWithEmailAndPassword(values.email, values.pass)
                        .then(() => {
                            setSubmitting(false);
                            resetForm();
                        })
                        .catch( error => {
                            setError(error.message ? error.message : error.code ? error.code : 'Sorry, an error occured')
                            setSubmitting(false)
                        });
                }}
            >
                {({values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting}) => (
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId='email'>
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control
                                type='text'
                                name='email'
                                placeholder='Your Email Address'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.email}
                                className={touched.email && `${errors.email ? 'is-invalid' : 'is-valid'}`}
                            />
                            {touched.email && errors.email ? <div className='is-invalid'>{errors.email}</div> : null}
                        </Form.Group>
                        <Form.Group controlId='pass'>
                            <Form.Label>Your Password</Form.Label>
                            <Form.Control
                                type='password'
                                name='pass'
                                placeholder='Your Password'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.pass}
                                className={touched.pass && `${errors.pass ? 'is-invalid' : 'is-valid'}`}
                            />
                            {touched.pass && errors.pass ? <div className='is-invalid'>{errors.pass}</div> : null}
                        </Form.Group>
                        <div className='d-flex flex-row justify-content-between'>
                            <Button
                                variant='primary'
                                type='submit'
                                disabled={isSubmitting || Object.keys(errors).length}
                            >
                                Sign In
                            </Button>
                            <Button
                                variant='outline-info'
                                onClick={() => dispatch({type: actions.LOGIN_LOGOUT_PAGE_SET, payload: 'signUp'})}
                            >
                                Create Account
                            </Button>
                        </div>
                        <div className='d-flex flex-row h-100 mt-4 align-items-baseline justify-content-between'>
                            <p className='mb-0'>Or sign in with</p>
                            <div>
                                <Button variant='outline-primary p-1 px-2 h-100 mx-2' onClick={() => signInGoogle()}>
                                    <FontAwesomeIcon icon={faGooglePlus} className='h-100' size='lg' />
                                </Button>
                                <Button variant='outline-primary p-1 px-2 h-100' onClick={() => signInFacebook()}>
                                    <FontAwesomeIcon icon={faFacebookF} />
                                </Button>
                            </div>
                        </div>
                        <div className='d-flex flex-row h-100 mt-4 justify-content-center'>
                            <Button
                                variant='outline-secondary'
                                onClick={() => dispatch({type: actions.LOGIN_LOGOUT_PAGE_SET, payload: 'forget'})}
                            >
                                Forget Password
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};
const ForgetForm = () => {
    const [error, setError] = useState(null);
    const [resetDone, setResetDone] = useState(false);
    const firebase = useFirebase();
    const dispatch = useDispatch();
    const validationSchema = yup.object().shape({
        email: yup
            .string()
            .email('* should be a valid email address')
            .max(100, '* should be less than 100 characters')
            .required('* email address is required'),
    });
    if (resetDone)
        return (
            <div className='signInOutForm text-center'>
                <FontAwesomeIcon icon={faCheckCircle} size='5x' />
                <h1 className='mt-5'>Email Sent</h1>
                <p className='mb-5'>Please check your inbox</p>
                <Button
                    variant='outline-info'
                    onClick={() => dispatch({type: actions.LOGIN_LOGOUT_PAGE_SET, payload: 'signIn'})}
                >
                    Sign In
                </Button>
            </div>
        );
    return (
        <div className='signInOutForm border-primary'>
            <h1 className='text-center mb-4'>Reset Password</h1>
            {error && <p className='text-danger'>error</p>}
            <Formik
                initialValues={{email: ''}}
                validationSchema={validationSchema}
                onSubmit={(values, {setSubmitting, resetForm}) => {
                    setSubmitting(true);
                    firebase
                        .passwordReset(values.email)
                        .then(() => {
                            setSubmitting(false);
                            setResetDone(true);
                        })
                        .catch((error) => {
                            setError(error.message ? error.message : error.code ? error.code : 'Sorry, an error occured')
                            setSubmitting(false)
                        });
                }}
            >
                {({values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting}) => (
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId='email'>
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control
                                type='text'
                                name='email'
                                placeholder='Your Email Address'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.email}
                                className={touched.email && `${errors.email ? 'is-invalid' : 'is-valid'}`}
                            />
                            {touched.email && errors.email ? <div className='is-invalid'>{errors.email}</div> : null}
                        </Form.Group>
                        <div className='d-flex flex-row h-100 mt-4 justify-content-center'>
                            <Button
                                variant='secondary'
                                type='submit'
                                disabled={isSubmitting || Object.keys(errors).length}
                            >
                                Send Password Reset Link
                            </Button>
                        </div>
                        <div className='d-flex flex-row mt-4 justify-content-between'>
                            <Button
                                variant='outline-info'
                                onClick={() => dispatch({type: actions.LOGIN_LOGOUT_PAGE_SET, payload: 'signIn'})}
                            >
                                Sign In
                            </Button>
                            <Button
                                variant='outline-info'
                                onClick={() => dispatch({type: actions.LOGIN_LOGOUT_PAGE_SET, payload: 'signUp'})}
                            >
                                Create Account
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};
export const LoginLogout = () => {
    const current = useSelector((state) => state.login_logout);
    const components = {
        signUp: SignUpForm,
        signIn: SignInForm,
        forget: ForgetForm,
    };
    const UsedComponent = current ? components[current] : components.signIn;
    return (
        <div className='vh-100 w-100 overflow-hidden d-flex flex-row align-items-center justify-content-center bg-secondary'>
            <UsedComponent />
        </div>
    );
};

const NeedAuthentication = ({children}) => {
    const session = useSelector(state => !!state.session)
    if (session) return <> {children}</>
    return <LoginLogout/>
}

export const syncUserData = ({firebase, dispatch, session}) => {
    if (!(session && session.uid) ) return;
    firebase.user(session.uid)
        .onSnapshot(snapshot => {
            if (snapshot.exists) {
            const data = snapshot.data()
                dispatch({type: actions.USERDATA_SET, payload: data});
            } else {
                const bareData = {clients: [], email: session.email}
                firebase.user(session.uid).set(bareData)
                dispatch({type: actions.USERDATA_SET, payload: bareData});
            }
        })
};

export const useAuthentication = () => useSelector(state => state.session)


export default NeedAuthentication