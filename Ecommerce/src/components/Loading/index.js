import React,{Component} from 'react';
import loadingStyle from './loading.scss';

class Loading extends Component {
    constructor(props){
        super(props);
    }
    render(){
        return  (
            <div>
                <div onClick ={this.props.close} className={loadingStyle.bak}></div>
                <div className={loadingStyle.content}>
                </div>
            </div>
        )
    }
}

export default Loading;