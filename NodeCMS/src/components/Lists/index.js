import React,{Component} from 'react';

class ListComponent extends Component{
    constructor(props){
        super(props);
    }
    render(){
        const {listData}=this.props;
        return <ul>
            {listData.map((item,index)=>{
                return <li key={index}>{item}</li>
            })}
        </ul>
    }
}
export default ListComponent;