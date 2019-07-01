
import React from 'react';
import {IResponsiveTable} from './ResponsiveTable.type';
let style = require('./ResponsiveTable.scss');

const ResponsiveTable = (props:React.PropsWithChildren<IResponsiveTable>)=>{
   return <><table className={style["responsive-table"]}>
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
</table></>
}

export default ResponsiveTable;