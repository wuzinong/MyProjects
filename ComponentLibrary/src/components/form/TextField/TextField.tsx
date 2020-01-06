import * as React from 'react';
import FormField from '../FormField/FormField';
import { TextFieldProps } from './TextField.types';
import cn from 'classnames';
import { HelperMessageType } from '../HelperMessage/HelperMessage.types';
const styles = require('./TextField.scss');

class TextField extends FormField<TextFieldProps> {
    public static defaultProps = {
        value: ''
    }

    // getIcon = (type:HelperMessageType)=>{
    //     switch (type) {
    //         case HelperMessageType.Error:
    //             return <Svg src={require('src/images/exclamation-triangle.svg')}/>
    //         case HelperMessageType.Success:
    //             return <Svg src={require('src/images/check.svg')}/>
    //         case HelperMessageType.Warning:
    //             return <Svg src={require('src/images/bell.svg')}/>
    //         case HelperMessageType.Info:
    //             return <Svg src={require('src/images/info.svg')}/>
    //         default: return null
    //     }
    // }

    render() {
        let { id, value, isReadOnly, onChange,showError,showWarning,showInfo,isDisabled,isOptional } = this.props;
        let isEmpty = typeof value === 'undefined' || value === null || value === '';
        return (
            <FormField {...this.props}>
                <div className={cn(styles['input-wrapper'],(!showError && !showWarning && !showInfo && (value != ""))?cn(styles[HelperMessageType.Success]): "")}>
                   <input  
                    autoComplete="no-need" 
                    id={id} 
                    className={cn(isEmpty ? styles['empty'] : null, isReadOnly ? styles['read-only'] : null)} 
                    type="text" 
                    value={value} 
                    onChange={onChange} 
                    readOnly={isReadOnly} 
                    disabled={!!isDisabled}
                   />
                    {/* {showError && <span className={cn(styles[HelperMessageType.Error])}>{this.getIcon(HelperMessageType.Error)}</span>}
                    {showWarning && <span className={cn(styles[HelperMessageType.Warning])}>{this.getIcon(HelperMessageType.Warning)}</span>}
                    {showInfo && <span className={cn(styles[HelperMessageType.Info])}>{this.getIcon(HelperMessageType.Info)}</span>}
                    {!showError && !showWarning && !showInfo && (value != "") && !isOptional && <span>{this.getIcon(HelperMessageType.Success)}</span>} */}
                </div>
            </FormField>
        );
    }
}

export default TextField;