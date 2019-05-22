
import React from 'react';
import {ICardProps} from './Card.types';

let style = require('./Card.scss');
let faUser = require('svgs/faUser.svg');
let faLockAlt = require('svgs/faLockAlt.svg');
let faCheckCircle = require('svgs/faCheckCircle.svg');

const Card = (props:ICardProps) =>{
   return <div className={style['card-wrapper']}>
           <div className={style['card-main']}>
                <img src={props.imgUrl} alt={props.altText}/>
                <article>
                    <strong>{props.title}</strong>
                    <p>{props.description}</p>
                </article>
                
           </div>
           <div>
                <p>{props.catetory}</p>
                <div className={style['card-bottom']}>
                    <span>
                        <span  dangerouslySetInnerHTML={{__html:faUser}}></span>
                        <span className={style['number']}>{props.userCount}</span>
                        <span  dangerouslySetInnerHTML={{__html:faLockAlt}}></span>
                        <span  dangerouslySetInnerHTML={{__html:faCheckCircle}}></span>
                    </span>
                    <span>
                        <img src={props.provider}/>
                    </span>
                </div>
           </div>
       </div>
}

export default Card;