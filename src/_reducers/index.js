import { combineReducers } from 'redux';

import { authentication } from './authentication.reducer';
import { buyticket } from './buyticket.reducer';
import { getbalance } from './getbalance.reducer';
import { withdraw } from './withdraw.reducer';
import { registration } from './registration.reducer';

import { alert } from './alert.reducer';

const rootReducer = combineReducers({
    authentication,
    registration,
    alert,
    buyticket,
    withdraw,
    getbalance
});

export default rootReducer;
