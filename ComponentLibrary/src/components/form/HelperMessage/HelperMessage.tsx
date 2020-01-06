import * as React from 'react';
import { HelperMessageProps,HelperMessageType } from './HelperMessage.types';
import cn from 'classnames';
const styles = require('./HelperMessage.scss');

const HelperMessage = (props: HelperMessageProps) => {
    // const getIcon = (type:HelperMessageType)=>{
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
return <div className={cn(styles['msg'],styles[props.type])}><span className={cn(styles['msg-tip'])}>{props.children}</span> </div>;
}

export default HelperMessage;