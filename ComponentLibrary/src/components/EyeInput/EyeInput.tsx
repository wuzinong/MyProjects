import React, { useState } from 'react';
import {IEyeInputState,EEyeInput} from './EyeInput.types';
var eyeSvg = require('svgs/eye.svg');
var eyeSlashSvg = require('svgs/eye-slash.svg');
const styles = require('./EyeInput.scss');

function EyeInput(){
    let eyeState:IEyeInputState;
    let changeState:any;
    [eyeState,changeState] = useState({showPassword:false});

  
    return <>
        <div className={styles['eye-input-wrapper']}>
            <input 
              type = {eyeState.showPassword ? 'text' : 'password'}
            />
            <span 
                onClick={()=>{changeState({showPassword:!eyeState.showPassword})}} 
                dangerouslySetInnerHTML={{__html:eyeState.showPassword?eyeSvg:eyeSlashSvg}}>
            </span>
        </div>
    </>
}

export default EyeInput;