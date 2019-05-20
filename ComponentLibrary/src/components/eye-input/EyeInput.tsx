import React from 'react';
import { IValidation} from 'types';

const styles = require('./index.scss');

export interface IEyeInputProps {
    placeHolder: string;
    cName?: string;
    isRequired?: boolean;
    fieldObj: IValidation;
    name: string;
    inputChange: (name: string, event: any) => void;
    inputBlur: (name: string, event: any) => void;
    inputFocus?:(name: string, event: any)=>void;
}
interface IEyeInputState{
    showPassword:boolean;
}

class EyeInput extends React.Component<IEyeInputProps,IEyeInputState> {
    constructor(props: IEyeInputProps) {
        super(props);
        this.state = {
            showPassword:false
        }
    }
    renderValidationMessage = (fieldId: string, errorClassName: string, validationResult: IValidation) => {
        if (!validationResult.isValid)
            return (
                <div>
                    <p className={'form-tip ' + errorClassName}>{validationResult.message}</p>
                </div>
            );
        return null;
    }

    renderEye(show: boolean) {
        return (
            <span onClick={() => this.showPassword(!show)}>
                test
            </span>
        );
    }

    getInputClassName(): string {
        //let cName = this.props.isRequired ? (styles['input_required'] + ' ') : '';
        let cName = !!this.props.cName ? this.props.cName+' ' : '';
        cName +=this.props.fieldObj.isValid? styles['valid']: styles['invalid'];
        
        return cName;
    }

    showPassword = (show: boolean) => {
        this.setState({
            showPassword: show
        })
    }

    render() {
        return (
            <div className={styles['eye-container']}>
                <div className={styles['btnEye-area'] + ' ' + this.getInputClassName()}>
                    <input
                        id={this.props.name}
                        onBlur={(event) => { this.props.inputBlur(this.props.name, event) }}
                        onChange={(event) => { this.props.inputChange(this.props.name, event) }}
                        type={this.state.showPassword ? 'text' : 'password'}
                        autoComplete="off"
                        value={this.props.fieldObj.value || ''}
                        placeholder={this.props.placeHolder} 
                        onFocus = {(event) => { 
                            if(this.props.inputFocus){
                              return  this.props.inputFocus(this.props.name, event)
                            }else{
                              return null;
                            }
                         }}
                        />
                    {this.renderEye(this.state.showPassword)}
                </div>
                {this.renderValidationMessage(this.props.name, styles['error-info'], this.props.fieldObj)}
            </div>
        );
    }
}

export default EyeInput;