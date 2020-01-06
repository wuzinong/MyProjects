import * as React from 'react';
import FormField from '../FormField/FormField';
import { TextAreaFieldProps } from './TextAreaField.types';
import cn from 'classnames';
const styles = require('./TextAreaField.scss');

class TextAreaField extends FormField<TextAreaFieldProps> {
    public static defaultProps = {
        value: ''
    }

    render() {
        let { id, value, rows, isReadOnly, onChange } = this.props;
        let isEmpty = typeof value === 'undefined' || value === null || value === '';
        return (
            <FormField {...this.props}>
                <textarea className={cn(isEmpty ? styles['empty'] : null, isReadOnly ? styles['read-only'] : null)} id={id} value={value} rows={rows} onChange={onChange} readOnly={isReadOnly}></textarea>
            </FormField>
        );
    }
}

export default TextAreaField;