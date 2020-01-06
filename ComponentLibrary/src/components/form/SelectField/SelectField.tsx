import * as React from 'react';
import FormField from '../FormField/FormField';
import { SelectFieldProps } from './SelectField.types';
import cn from 'classnames';
const styles = require('./SelectField.scss');

class SelectField extends FormField<SelectFieldProps> {
    public static defaultProps = {
        value: ''
    }
    availableCountryList = ['AU', 'AT', 'BE', 'BG', 'CA', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'CN', 'GR', 'HU', 'IS', 'IE', 'IT', 'JP', 'KR', 'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO','NZ', 'PL', 'PT', 'RO', 'SG', 'SK', 'SI', 'ES', 'SE', 'CH', 'GB', 'AE', 'US'];

    render() {
        let { id, options, value, isReadOnly, onChange,shouldDisable } = this.props;
        let isEmpty = typeof value === 'undefined' || value === null || value === '';
        return (
            <FormField {...this.props}>
                <div className={cn(styles['arrow-container'],shouldDisable&&styles['disable-style'])}>
                    <select 
                    autoComplete="no-need" 
                    id={id} 
                    className={cn(isEmpty ? styles['empty'] : null, isReadOnly ? styles['read-only'] : null)} 
                    onChange={onChange}
                    defaultValue = {value}
                    >
                        {options && 
                        options.map((item) => <option key={item.value} className={cn(this.availableCountryList.indexOf(item.value)>=0 && styles['available-country'])} value={item.value}>{item.label}</option>)}
                    </select>
                </div>
            </FormField>
        );
    }
}

export default SelectField;