import React from 'react';
import {ICardSimpleProps} from './CardSimple.types';
let style = require('./CardSimple.scss');

const CardSimple = (props:ICardSimpleProps) =>{
 
   return <div className={style['card-simple-wrapper']}>
            <img src={props.imgUrl} alt={props.altText}/>
            <strong>{props.title}</strong>
            <p>{props.description}</p>
       </div>
}

export default CardSimple;