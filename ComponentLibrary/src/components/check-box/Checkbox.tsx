import React from 'react';
import {ICheckboxProps,ICheckboxStates} from './Checkbox.types';
const styles = require('./index.scss');

export class Checkbox extends React.PureComponent<ICheckboxProps, ICheckboxStates> {
    constructor(props: ICheckboxProps) {
        super(props);
        this.state = {
            isChecked: this.props.isChecked
        }
    }
    handleClick = (e: any) => {
        if (!this.props.isDisabled) {
            let status = !this.state.isChecked;
            this.setState({
                isChecked: status
            });
            this.props.onChange(this.props.fieldName, status);
        }
    }
    render() {
        let cName1 = this.state.isChecked ? styles['checkbox-label-back'] : "";
        let cName = styles['checkbox-label'] + " " + cName1;
        return (
            <div className={this.props.isDisabled ? styles['disabled'] : ""}>
                <label className={cName}>
                    <input
                        type="checkbox"
                        value={this.props.isChecked.toString()}
                        onChange={this.handleClick}
                        checked={this.state.isChecked}/>
                    <span className={styles['checkbox-slider']}></span>
                </label>
            </div>
        );
    }
}

export default Checkbox;