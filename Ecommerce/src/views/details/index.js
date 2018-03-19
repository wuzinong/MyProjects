import DetailsComponent from './details-component';
import {connect} from 'react-redux';

const mapDispatchToProps =(dispatch,props)=>{
    return {
        handleClick(){
            props.history.push("/");
         }
    }
}
const mapStateToProps = (state)=>{
    return {

    }
}

const Details = connect(
    mapDispatchToProps,
    mapStateToProps
)(DetailsComponent);

export default Details;