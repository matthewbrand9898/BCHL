import React, { useEffect } from 'react';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ScrollToTop from '../_helpers/scrolltop'
import { history } from '../_helpers';
import { alertActions } from '../_actions';
import { PrivateRoute } from '../_components';
import { HomePage } from '../HomePage';
import { LoginPage } from '../LoginPage';
import { RegisterPage } from '../RegisterPage';
import { AboutPage } from '../AboutPage';
function App() {
    const alert = useSelector(state => state.alert);
    const dispatch = useDispatch();

    useEffect(() => {


      const   timer = setTimeout(
          () => dispatch(alertActions.clear()),5000);

return () => clearTimeout(timer);


    });



    return (

//style={{ backgroundImage: `url(${background})`  , backgroundPosition: 'center', width:'100%', minHeight: '100%'}}
        <div className="bg-light" >



                    {alert.message &&
                        <div style={{ position: 'fixed', zIndex: '10', width:'100vw', textAlign:'center' }} className={`alert ${alert.type}`}>{alert.message}</div>
                    }
                    <Router history={history}>
                    <ScrollToTop />
                        <Switch>
                            <PrivateRoute exact path="/" component={HomePage} />
                            <Route path="/login" component={LoginPage} />
                            <Route path="/about" component={AboutPage} />
                            <Route path="/register" component={RegisterPage} />
                            <Redirect from="*" to="/" />
                        </Switch>
                    </Router>
        </div>
    );
}

export { App };
