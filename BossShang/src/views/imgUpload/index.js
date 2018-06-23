
import {connect} from 'react-redux';
import ImgUploadComponent from './imgUpload-component';

const mapDispatchToProps = (dispatch,props)=>{
    return {
       handleClick(){
          props.history.push("/about");
       }
    }
}

const mapStateToProps=(state)=>{
     return {
         
     }
}

const ImgUpload = connect(
    mapStateToProps,
    mapDispatchToProps
)(ImgUploadComponent)
export default ImgUpload;