import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import  logo  from '../HomePage/logo.png';

import { userActions } from '../_actions';
import  logo2  from '../LoginPage/logo.png';
import howTo from '../HomePage/howto.png';
function LoginPage() {
    const [inputs, setInputs] = useState({
        username: '',
        password: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const { username, password } = inputs;
    const loggingIn = useSelector(state => state.authentication.loggingIn);
    const dispatch = useDispatch();
    const location = useLocation();

    // reset login status
    useEffect(() => {
        dispatch(userActions.logout());
    }, []);

    function handleChange(e) {
        const { name, value } = e.target;
        setInputs(inputs => ({ ...inputs, [name]: value }));
    }

    function handleSubmit(e) {
        e.preventDefault();

        setSubmitted(true);
        if (username && password) {
            // get return url from location state or default to home page
            const { from } = location.state || { from: { pathname: "/" } };
            dispatch(userActions.login(username, password, from));
        }
    }

    return (
        <div style={{minHeight:'100vh'}}  className="container-fluid" >

          <div style={{minHeight:'100vh'}}  className='row justify-content-center align-items-center'>
            <div style={{height:'500px',display:'flex'}}  className="col justify-content-center align-items-center">
                <div style={{width:'500px'}}  className="card login-card">
                <img  style={{width:'250px',margin: '0 auto ',position:'relative',top:'10px'}} src={logo2} />
              <div  className="card-body">

                          <div style={{textAlign:'center',color:'black'}}  className="login-card-description"><b> Sign in to your account</b> </div>
            <form name="form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label style={{textAlign:'center',color:'black',display:'flex'}} className=" justify-content-start align-items-center">Username</label>
                    <input type="text" name="username" value={username} onChange={handleChange} className={'form-control' + (submitted && !username ? ' is-invalid' : '')} />
                    {submitted && !username &&
                        <div className="invalid-feedback">Username is required</div>
                    }
                </div>
                <div className="form-group">
                    <label style={{textAlign:'center',color:'black',display:'flex'}} className=" justify-content-start align-items-center">Password</label>
                    <input type="password" name="password" value={password} onChange={handleChange} className={'form-control' + (submitted && !password ? ' is-invalid' : '')} />
                    {submitted && !password &&
                        <div className="invalid-feedback">Password is required</div>
                    }
                </div>
                <div className="form-group">
                    <button style={{display:'flex'}} className="btn btn-primary justify-content-start align-items-center">
                        {loggingIn && <span className="spinner-border spinner-border-sm mr-1"></span>}
                        Login
                    </button>
                    <p style={{textAlign:'center',color:'black'}}  className="login-card-footer-text"><b>Don't have an account?</b> <Link to="/register" className="btn btn-link">Register</Link></p>

                </div>
            </form>
            </div>
            </div>
        </div>
        </div>
        </div>
    );
}

export { LoginPage };
