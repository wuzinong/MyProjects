import {connect} from 'react-redux';
import SkeletonLoadingComponent from './skeletonLoading-component';

const mapDispatchToProps = (dispatch)=>{
    return {

    }
}

const mapStateToProps = (state)=>{

}
const SkeletonLoading = connect(
    mapStateToProps,
    mapDispatchToProps
)(SkeletonLoadingComponent)

export default SkeletonLoading;