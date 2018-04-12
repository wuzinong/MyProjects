import React,{Component} from 'react';
import searchStyle from './search.scss';
import {Link} from 'react-router-dom';

class Search extends Component{
    constructor(props){
        super(props);
    }
    render(){
        return(
            <div className={"row "+searchStyle.search}>
               <div className={"col-lg-9 col-sm-12 nopadding "+searchStyle.tag}>
                   <Link to="/">Search</Link>
                   <Link to="/">Data</Link>
               </div>
               <div className={"col-lg-3 col-sm-12 row nopadding "+searchStyle.outer}>
                  <input type="text" className="col-9 nopadding" autoComplete="off"  placeholder="Enter your search text here."/>
                  <div className="col-3 input-group-btn nopadding">
                    <Link className={" "+searchStyle.btn} to="/">
                       Go
                    </Link>
                 </div>
               </div>
            </div>
        )
    }
}
export default Search;
