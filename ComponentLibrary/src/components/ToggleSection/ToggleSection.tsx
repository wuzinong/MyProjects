import React, { useState } from 'react';
const styles = require('./ToggleSection.scss');


interface ToggleSectionProps {
    /** If true, show the mobile variant of the component. */
    breakIf?: boolean;
    label: React.ReactNode;
    content: React.ReactNode;
}

let ToggleSection:React.FC<ToggleSectionProps> = (props)=>{
    let [isOpen,setOpen] = useState(false);
    return <>
         <div onClick={()=>{setOpen(!isOpen)}}>{props.label}</div>
         {isOpen && <div>
            {props.content}
            {props.children}
         </div>}
    </>
}

export default ToggleSection;