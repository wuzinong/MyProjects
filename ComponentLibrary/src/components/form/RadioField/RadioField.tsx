import * as React from 'react';
import HelperMessage from '../HelperMessage/HelperMessage';
import { HelperMessageType } from '../HelperMessage/HelperMessage.types';
import { RadioFieldProps } from './RadioField.types';
import cn from 'classnames';
const styles = require('./RadioField.scss');


class RadioField extends React.PureComponent<RadioFieldProps> {

    render() {
        let { id, label, value, isChecked, isReadOnly, onChange, showError, errorMessage, showWarning, warningMessage, showInfo, infoMessage } = this.props;
        let isEmpty = typeof value === 'undefined' || value === null;
        return <>
            <label htmlFor={id} className={styles['container']}>{label}
                <input id={id} className={cn(isEmpty ? styles['empty'] : null, isReadOnly ? styles['read-only'] : null)} type="radio" value={`${value}`} checked={isChecked} onChange={onChange} readOnly={isReadOnly} />
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

export default RadioField;