import React from 'react';
import {connect} from 'react-redux';
import AboutComponent from './about-component.js';

const mapDispatchToProps = (dispatch,props)=>{
    return {
       handleClick(){
          props.history.push("/about");
       }
    }
}

const mapStateToProps=(state)=>{
     return {
        ...state.AboutReducer
     }
}

const About = connect(
    mapStateToProps,
    mapDispatchToProps
)(AboutComponent)
export default About;