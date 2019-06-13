
import React from 'react';
import {IResponsiveTable} from './ResponsiveTable.type';
let style = require('./ResponsiveTable.scss');

const ResponsiveTable = (props:React.PropsWithChildren<IResponsiveTable>)=>{
   return <div className={style['wrapper']}>
            <div className={style['header']}>
                <span>1hdfsdf</span>
                <span>2hdfsdf</span>
                <span>3hdfsdf</span>
                <span>4hdfsdf</span>
                <span>5hdfsdf</span>
            </div>
            <div className={style['content-wrapper']}>
                <div className={style['content']}>
                        <span>1fffffffffffffffffffffffffffffffff</span>
                        <span>2hdfsdf</span>
                        <span>3d</span>
                        <span>4dddddddddddddddddddddddd</span>
                        <span>5hdfsdf</span>
                </div>
                <div className={style['content']}>
                        <span>1fffffffffffffff3ffff</span>
                        <span>2hdfsdf</span>
                        <span>3d</span>
                        <span>4dddddddddddddddddddddddddddd</span>
                        <span>5hdfsdf</span>
                </div>
                <div className={style['content']}>
                        <span>1fffffffffffffff3ffff</span>
                        <span>2hddddddddddddddddf</span>
                        <span>3d</span>
                        <span>4dddddddddddddddddddddd3ddddddddddd</span>
                        <span>5hdfsdf</span>
                </div>
                <div className={style['content']}>
                        <span>1fffffffffffffff3ffff</span>
                        <span>2hddddddddddddddddf</span>
                        <span>sdddddddd</span>
                </div>
                <div className={style['content']}>
                        <span>1fffffffffffffff3ffff</span>
                        <span>2hddddddddddddddddf</span>
                        <span>3d</span>
                        <span>4dddddddddddddddddddddd3ddddddddddd</span>
                        <span>5hdfsdf</span>
                </div>
                <div className={style['content']}>
                        <span>1fffffffffffffff3ffff</span>
                        <span>2hddddddddddddddddf</span>
                        <span>3d</span>
                        <span>4dddddddddddddddddddddd3ddddddddddd</span>
                        <span>5hdfsdf</span>
                </div>
                <div className={style['content']}>
                        <span>1fffffffffffffff3ffff</span>
                        <span>2hddddddddddddddddf</span>
                        <span>3d</span>
                        <span>4dddddddddddddddddddddd3ddddddddddd</span>
                        <span>5hdfsdf</span>
                </div>
                <div className={style['content']}>
                        <span>1fffffffffffffff3ffff</span>
                        <span>2hddddddddddddddddf</span>
                        <span>3d</span>
                        <span>4dddddddddddddddddddddd3ddddddddddd</span>
                        <span>5hdfsdf</span>
                </div>
                <div className={style['content']}>
                        <span>1fffffffffffffff3ffff</span>
                        <span>2hddddddddddddddddf</span>
                        <span>3d</span>
                        <span>4dddddddddddddddddddddd3ddddddddddd</span>
                        <span>5hdfsdf</span>
                </div>
            </div>
   </div>
}

export default ResponsiveTable;