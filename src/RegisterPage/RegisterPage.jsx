import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import  logo  from '../LoginPage/logo.png';
import { userActions } from '../_actions';
import  logo2  from '../HomePage/logo.png';

function RegisterPage() {
    const [user, setUser] = useState({

        BCHAddress: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const registering = useSelector(state => state.registration.registering);
    const dispatch = useDispatch();

    // reset login status
    useEffect(() => {
        dispatch(userActions.logout());
    }, []);

    function handleChange(e) {
        const { name, value } = e.target;
        setUser(user => ({ ...user, [name]: value }));
    }

    function handleSubmit(e) {
        e.preventDefault();

        setSubmitted(true);
        if ( user.username && user.password && user.email && user.password ) {
            dispatch(userActions.register(user));
        }
    }

    return (
        <div  className="container-fluid">
        <div   className='row justify-content-center align-items-center'>
        <div style={{height:'100vh' ,display: 'flex' }} className='col align-items-center justify-content-center'>

          <div style={{width:'500px'}} className="card login-card">
            <img  style={{width:'250px',margin: '0 auto ',position:'relative',top:'10px'}} src={logo} />
          <div  className="card-body">
          <div style={{textAlign:'center',color:'black'}}  className="login-card-description"><b> Register your account</b> </div>
          <form name="form" onSubmit={handleSubmit}>

              <div className="form-group">
                  <label style={{color:'black'}}>Username</label>
                  <input type="text" name="username" value={user.username} onChange={handleChange} className={'form-control' + (submitted && !user.username ? ' is-invalid' : '')} />
                  {submitted && !user.username &&
                      <div className="invalid-feedback">Username is required</div>
                  }
              </div>
              <div className="form-group">
                  <label style={{color:'black'}}>Email</label>
                  <input type="email" name="email" value={user.email} onChange={handleChange} className={'form-control' + (submitted && !user.email ? ' is-invalid' : '')} />
                  {submitted && !user.email &&
                      <div className="invalid-feedback">Email is required</div>
                  }
              </div>
              <div className="form-group">
                  <label style={{color:'black'}}>Password</label>
                  <input type="password" name="password" value={user.password} onChange={handleChange} className={'form-control' + (submitted && !user.password ? ' is-invalid' : '')} />
                  {submitted && !user.password &&
                      <div className="invalid-feedback">Password is required</div>
                  }
              </div>
              <div className="form-group">
                  <label style={{color:'black'}}> Confirm Password</label>
                  <input type="password" name="confirmPassword" value={user.confirmPassword} onChange={handleChange} className={'form-control' + (submitted && user.confirmPassword != user.password ? ' is-invalid' : '')} />
                  {submitted && user.password != user.confirmPassword &&
                      <div className="invalid-feedback">Password must match.</div>
                  }
              </div>
              <div className="form-group">
                  <button className="btn btn-primary">
                      {registering && <span className="spinner-border spinner-border-sm mr-1"></span>}
                      Register
                  </button>
                  <Link to="/login" className="btn btn-link">Cancel</Link>
              </div>
          </form>
          </div>
          </div>
          </div>


          </div>
        </div>

    );
}

export { RegisterPage };
