 import {connect} from 'react-redux';
 import IntermediateComponent from './intermediate-component';

 const mapDispatchToProps=(dispatch,props)=>{
     return {

     }
 }
 const mapStateToPrpos = (state)=>{
     return {

     }
 }
 const Intermediate = connect(
     mapStateToPrpos,
     mapDispatchToProps
 )(IntermediateComponent);
 export default Intermediate;