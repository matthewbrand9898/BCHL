import { userConstants } from '../_constants';


const initialState = {balance:undefined, showbutton:true};

export function getbalance(state = initialState, action) {
    switch (action.type) {


        case userConstants.GETBALANCE_REQUEST_SUCCESS:
                    return {
                      balance: action.user,
                        showbutton: true

                            };
          case userConstants.GETBALANCE_REQUEST:
                                        return {
                                          balance: undefined,
                                            showbutton: false

                                                };
              case userConstants.GETBALANCE_REQUEST_FAILURE:
                        return {
                          balance: undefined,
                              showbutton: true

                                  };

        default:
            return state
    }
}
