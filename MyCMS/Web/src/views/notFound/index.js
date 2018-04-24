import {connect} from 'react-redux';
import NotFoundComponent from './notFound-component';

const mapDispatchToProps = (dispatch)=>{
    return {

    }
}

const mapStateToProps = (state)=>{

}
const NotFound = connect(
    mapStateToProps,
    mapDispatchToProps
)(NotFoundComponent)

export default NotFound;