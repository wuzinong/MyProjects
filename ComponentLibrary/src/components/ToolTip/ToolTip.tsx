import React,{useState} from 'react';
import {IToolTipProps} from './ToolTip.type';
const styles = require('./ToolTip.scss');

function ToolTip(props:IToolTipProps){
    
    return props.show ? <span className={styles['tip-wrapper']}>
        {props.tips}
    </span> : null;
}


export default ToolTip;