import * as React from 'react';
import HelperMessage from '../HelperMessage/HelperMessage';
import { HelperMessageType } from '../HelperMessage/HelperMessage.types';
import { CheckboxFieldProps } from './CheckboxField.types';
import cn from 'classnames';
const styles = require('./CheckboxField.scss');

class CheckboxField extends React.PureComponent<CheckboxFieldProps> {
    public static defaultProps = {
        value: false
    }

    render() {
        let { id, label, value, isChecked, isReadOnly, onChange, showError, errorMessage, showWarning, warningMessage, showInfo, infoMessage } = this.props;
        let isEmpty = typeof value === 'undefined' || value === null;
        return <>
            <label htmlFor={id} className={styles['container']}>{label}
                <input id={id} className={cn(isEmpty ? styles['empty'] : null, isReadOnly ? styles['read-only'] : null)} type="checkbox" value={`${value}`} checked={isChecked} onChange={onChange} readOnly={isReadOnly} />
                <div className={cn(styles['check-mark'], isChecked ? styles['checked'] : null)}>
                    <div className={styles['check']}></div>
                </div>
            </label>
            {showError && <HelperMessage type={HelperMessageType.Error}>{errorMessage}</HelperMessage>}
            {showWarning && <HelperMessage type={HelperMessageType.Warning}>{warningMessage}</HelperMessage>}
            {showInfo && <HelperMessage type={HelperMessageType.Info}>{infoMessage}</HelperMessage>}
        </>;
    }
}

export default CheckboxField;