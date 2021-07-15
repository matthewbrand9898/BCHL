import { userConstants } from '../_constants';


const initialState = { showbutton:true };

export function withdraw(state = initialState, action) {
    switch (action.type) {


        case userConstants.WITHDRAW_REQUEST_SUCCESS:
                    return {
                        showbutton: true,

                            };
          case userConstants.WITHDRAW_REQUEST:
                                        return {
                                            showbutton: false,

                                                };
              case userConstants.WITHDRAW_REQUEST_FAILURE:
                        return {
                              showbutton: true,

                                  };

        default:
            return state
    }
}
