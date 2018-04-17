import React from 'react';
import {connect} from 'react-redux';
import LoginComponent from './login-component';
import {LoginFunc} from '../../reducers/login-reducer';

const mapDispatchToProps = (dispatch,props)=>{
        const Login = (data)=>{
            dispatch(LoginFunc(data));
        }

        return {
            Login
        }
   
}

const mapStateToProps = (state)=>{

    const {ifLogin,code,message} = state;
    return {
        ifLogin,
        code,
        message
    }
}

const Login = connect(
    mapStateToProps,
    mapDispatchToProps
)(LoginComponent);

export default Login;