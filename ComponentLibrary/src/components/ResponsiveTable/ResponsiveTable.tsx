
import React from 'react';
import {IResponsiveTable} from './ResponsiveTable.type';
let styles = require('./ResponsiveTable.scss');

const ResponsiveTable = (props:React.PropsWithChildren<IResponsiveTable>)=>{
   return <div className={`${styles["table-wrapper"]}`}>
       <table className={`${styles["fl-table"]} ${styles["table-sticky"]}`}>
            <thead>
               <tr>
                {props.items.head.map(item=>{
                        return <th>
                                {item}
                        </th>
                    })}
               </tr>
            </thead>
            <tbody>
                {props.items.body.map((item)=>{
                    return <tr>
                            {
                                item.map(details=>{
                                        return <td>
                                            {details}
                                        </td>
                                })
                            }
                    </tr> 
                })}
            </tbody>
            </table>
   </div>
}

export default ResponsiveTable;