import { userConstants } from '../_constants';
import { userService } from '../_services';
import { alertActions } from './';
import { history } from '../_helpers';

export const userActions = {
    login,
    logout,
    register,
    buyticket,
    withdraw,
    getbalance,
    getTickets
};



function login(username, password, from) {
    return dispatch => {
        dispatch(request({ username }));

        userService.login(username, password)
            .then(
                user => {
                    dispatch(success(user));
                    history.push(from);
                },
                error => {
                    dispatch(failure(error.toString()));
                    dispatch(alertActions.error(error.toString()));
                }
            );
    };

    function request(user) { return { type: userConstants.LOGIN_REQUEST, user } }
    function success(user) { return { type: userConstants.LOGIN_SUCCESS, user } }
    function failure(error) { return { type: userConstants.LOGIN_FAILURE, error } }
}

function logout() {
    userService.logout();
    return { type: userConstants.LOGOUT };
}

function register(user) {
    return dispatch => {
        dispatch(request(user));

        userService.register(user)
            .then(
                user => {
                    dispatch(success());
                    history.push('/login');
                    dispatch(alertActions.success('Registration successful'));
                },
                error => {
                    dispatch(failure(error.toString()));
                    dispatch(alertActions.error(error.toString()));
                }
            );
    };

    function request(user) { return { type: userConstants.REGISTER_REQUEST, user } }
    function success(user) { return { type: userConstants.REGISTER_SUCCESS, user } }
    function failure(error) { return { type: userConstants.REGISTER_FAILURE, error } }
}

function buyticket(user) {
    return dispatch => {
        dispatch(request(user));

        userService.buyticket(user)
            .then(
                user => {
                  dispatch(success(user));
                    dispatch(alertActions.success('your purchase was successful. Goodluck!'));
                },
                error => {
                    dispatch(failure(error.toString(),user));
                    dispatch(alertActions.error(error.toString()));
                }

            );
    };
    function request(user) { return { type: userConstants.BUYTICKET_REQUEST, user } }
    function success(user) { return { type: userConstants.BUYTICKET_REQUEST_SUCCESS, user} }
    function failure( error,user) { return { type: userConstants.BUYTICKET_REQUEST_FAILURE, error,user } }
}

function getbalance(user) {
    return dispatch => {
        dispatch(request(user));

        userService.getbalance(user)
            .then(
                user => dispatch(success(user)),
                error => dispatch(failure(user, error.toString()))
            );
    };
    function request(user) { return { type: userConstants.GETBALANCE_REQUEST, user } }
    function success(user) { return { type: userConstants.GETBALANCE_REQUEST_SUCCESS, user} }
    function failure( error) { return { type: userConstants.GETBALANCE_REQUEST_FAILURE, error } }
}

function getTickets(user) {
    return dispatch => {
        dispatch(request(user));

        userService.getTickets(user)
            .then(
                user => dispatch(success(user)),
                error => dispatch(failure(user, error.toString()))
            );
    };
    function request(user) { return { type: userConstants.GETTICKET_REQUEST, user } }
    function success(user) { return { type: userConstants.GETTICKET_REQUEST_SUCCESS, user} }
    function failure( error) { return { type: userConstants.GETTICKET_REQUEST_FAILURE, error } }
}

function withdraw(user,withdrawaddress) {
    return dispatch => {

        dispatch(request(user));

        userService.withdraw(user,withdrawaddress)
            .then(
              user => {
                dispatch(success(user));
                  dispatch(alertActions.success('Withdraw successful.'));
              },
                error => {
                    dispatch(failure(error.toString()));
                    dispatch(alertActions.error(error.toString()));
                }
            );
    };
    function request(user) { return { type: userConstants.WITHDRAW_REQUEST, user } }
    function success(user) { return { type: userConstants.WITHDRAW_REQUEST_SUCCESS, user} }
    function failure( error) { return { type: userConstants.WITHDRAW_REQUEST_FAILURE, error } }
}
