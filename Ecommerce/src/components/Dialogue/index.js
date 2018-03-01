import React,{Component} from 'react';
import dialogueStyle from './dialogue.scss';
class Dialogue extends Component{
    constructor(props){
        super(props);
    }
    render(){

        return (
            <div>
               <div onClick ={this.props.close} className={dialogueStyle.bak}></div>
               <div className={dialogueStyle.content}>
                   {this.props.info}
               </div>
            </div>
        )
    }
}
export default Dialogue
