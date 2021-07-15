import { userConstants } from '../_constants';

let user = JSON.parse(localStorage.getItem('user'));



const initialState =  user ? { Ticket: user.Ticket, showbutton:true } : {};

export function buyticket(state = initialState, action) {
    switch (action.type) {
      case userConstants.LOGIN_SUCCESS:
          return {

              Ticket: action.user.Ticket,
                    showbutton: true

          };

        case userConstants.BUYTICKET_REQUEST_SUCCESS:
                    return {
                        Ticket: action.user.Ticket,
                        showbutton: true

                            };
          case userConstants.BUYTICKET_REQUEST:
                                        return {
                                          Ticket: undefined,
                                            showbutton: false

                                                };
              case userConstants.BUYTICKET_REQUEST_FAILURE:
                        return {
                          Ticket: action.user.Ticket,
                              showbutton: true

                                  };

                                  

        default:
            return state
    }
}
