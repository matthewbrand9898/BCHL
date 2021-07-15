import config from 'config';
import { authHeader } from '../_helpers';

export const userService = {
    login,
    logout,
    register,
    buyticket,
    withdraw,
    getbalance,
    getTickets
};

function login(username, password) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    };

    return fetch(`${config.apiUrl}/users/authenticate`, requestOptions)
        .then(handleResponse)
        .then(user => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('user', JSON.stringify(user));

            return user;
        });
}

function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('user');
}

function getTickets(user) {
//  console.log(JSON.stringify(user))


    const requestOptions = {

        method: 'POST',
        headers: {...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(user)

    };
  return fetch(`${config.apiUrl}/users/getTickets`, requestOptions).then(handleResponse).then(user => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
    let getUser = JSON.parse(localStorage.getItem('user'));

      getUser.Ticket = user.Ticket;
        localStorage.setItem('user', JSON.stringify(getUser));

        return user;
    });

}



function register(user) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    };

    return fetch(`${config.apiUrl}/users/register`, requestOptions).then(handleResponse);
}


function getbalance(user) {
    const requestOptions = {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    };

    return fetch(`${config.apiUrl}/users/getbalance`, requestOptions).then(handleResponse);
}


function buyticket(user) {
    const requestOptions = {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    };

    return fetch(`${config.apiUrl}/users/buyticket`, requestOptions).then(handleResponse)  .then(user => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
      let getUser = JSON.parse(localStorage.getItem('user'));

        getUser.Ticket = user.Ticket;
          localStorage.setItem('user', JSON.stringify(getUser));

          return user;
      });
}

function withdraw(user,withdrawaddress) {

    const requestOptions = {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify([user,withdrawaddress])
    };

    return fetch(`${config.apiUrl}/users/withdraw`, requestOptions).then(handleResponse);
}

function handleResponse(response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            if (response.status === 401) {
                // auto logout if 401 response returned from api
                logout();
                location.reload(true);
            }


            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }

        return data;
    });
}
