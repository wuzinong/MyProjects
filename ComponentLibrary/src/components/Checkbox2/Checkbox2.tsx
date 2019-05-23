import React,{useState} from 'react';
import { ICheckboxProps,ICheckboxState } from './Checkbox2.types';
const styles = require('./Checkbox2.scss');


const Checkbox = (props:ICheckboxProps) =>{
    let checkState:ICheckboxState;
    let setCheckState:any;
    [checkState,setCheckState] = useState({isChecked:props.isChecked});
    return <span className={styles['checkbox-wrapper']}>
                <input id={props.name}
                    type="checkbox"
                    onChange={(event) => {
                        let newState = {isChecked:!checkState.isChecked};
                        setCheckState(newState);
                        props.checkboxChange(props.name,newState.isChecked, event)
                    }}
                    checked={checkState.isChecked}
                />
                <label htmlFor={props.name} >
                    <span className={styles['checkbox-span']}></span>
                    <span className={styles['checkbox-label']}>{props.labelText}</span>
                </label>
            </span>
 }
 
 export default Checkbox;