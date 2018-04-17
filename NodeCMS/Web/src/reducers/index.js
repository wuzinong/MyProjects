import {combineReducers} from 'redux';
// import {HomeReducer} from './home-reducer.js';
// import {AboutReducer} from './about-reducer';
import {ListReducer} from './list-reducer';
import {LoginReducer} from './login-reducer';
export default combineReducers({
    // HomeReducer,
    // AboutReducer,
    LoginReducer,
    ListReducer
})