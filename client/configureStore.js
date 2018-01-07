import {createStore, applyMiddleware} from 'redux'
import mainReducer from './reducers'
import {composeWithDevTools} from 'redux-devtools-extension'
import thunk from 'redux-thunk'

const store = createStore(mainReducer,composeWithDevTools(applyMiddleware(thunk)));

export default store;
