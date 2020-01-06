import * as React from 'react';
import {ReactNode,useState} from 'react';
import {CheckoutWrapperProps} from './CheckoutWrapper.type';


const SectionWrapper = function(item,title,open=false){
    let [isOpen,setOpen] = useState(open);
    let validate = ()=>{
        
    }
    let cancel = ()=>{
        
    }
    return <div>
        <h2>{title} {isOpen && <span>Edit</span>}</h2>
        {item}
        <div className="col">
            <button onClick={()=>{}}>Cancel</button>
            <button onClick={validate}>Next</button>
        </div>
    </div>
}
 
export const CheckoutWrapper = (props:CheckoutWrapperProps)=>{

    
    return <section>
        {props.children.map((item)=>{
            return <SectionWrapper
                  item={item}
                  title={props.title}
                  isOpen={props.open}
            />
        })}
    </section>
}