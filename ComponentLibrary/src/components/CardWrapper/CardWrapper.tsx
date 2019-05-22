import React from 'react';
import {ICardWrapperProps} from './CardWrapper.type';
let style = require('./CardWrapper.scss');

const CardWrapper = (props:React.PropsWithChildren<ICardWrapperProps>)=>{
   return <div className={style['wrapper']}>
       <div className={style['title']}>
           <strong>{props.cardTitle}</strong>
           <p>{props.cardDescription}</p>
       </div>
       <div className={style['item-wrapper']}>
          {props.children}
       </div>
   </div>
}

export default CardWrapper;