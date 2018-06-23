import React from 'react';
import {connect} from 'react-redux';
import HomeComponent from './home-component.js';

const mapDispatchToProps = (dispatch,props)=>{
    return {
       handleClick(){
          props.history.push("/about");
       }
    }
}

const mapStateToProps=(state)=>{
     return {
        ...state.HomeReducer
     }
}

const Home = connect(
    mapStateToProps,
    mapDispatchToProps
)(HomeComponent)
export default Home;