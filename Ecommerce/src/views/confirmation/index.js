import {connect} from 'react-redux';
import ConfirmationComponent from './confirmation-component';

const mapStateToProps = state=>{
    return {
        
    }
}
const mapDispatchToProps=(dispatch,props)=>{
    return {
      
    }
}

let Confirmation = connect(
    mapStateToProps,
    mapDispatchToProps
)(ConfirmationComponent);

export default Confirmation; 