import * as React from 'react';
import { IFormFieldProps } from './FormField.types';
import HelperMessage from '../HelperMessage/HelperMessage';
import { HelperMessageType } from '../HelperMessage/HelperMessage.types';
import cn from 'classnames';
const styles = require('./FormField.scss');

interface IState{
    showMessage:boolean;
    imageUrl?:string;
    callingCode?:string;
    countryCode?:string;
}
class FormField<T extends IFormFieldProps> extends React.PureComponent<T,IState>  {
    constructor(props){
        super(props);
        this.state = {
            showMessage:false
        }
    }
    showTip = (show:boolean)=>{
        this.setState({
            showMessage:show
        });
    }
    render() {
        let { id, label, children, showError, errorMessage, showWarning, warningMessage, showInfo, infoMessage,withTip,tipMsg,isOptional} = this.props;
        return <>
            <label 
              htmlFor={id}>
                  {label} {isOptional && <span className={cn(styles['optional'])}>(optional)</span>}
                  {withTip && (this.state.showMessage?<span className={cn(styles['tip-icon'])} onClick={()=>{this.showTip(false)}}></span>:<span className={cn(styles['tip-icon'])} onClick={()=>{this.showTip(true)}}></span>)}
            </label>
            {(this.state.showMessage?<div className={cn(styles['tip-msg'])}>{tipMsg}</div>:<div></div>)}
            {children}
            {showError && <HelperMessage type={HelperMessageType.Error}>{errorMessage}</HelperMessage>}
            {showWarning && <HelperMessage type={HelperMessageType.Warning}>{warningMessage}</HelperMessage>}
            {showInfo && <HelperMessage type={HelperMessageType.Info}>{infoMessage}</HelperMessage>}
        </>;
    }
}

export default FormField;