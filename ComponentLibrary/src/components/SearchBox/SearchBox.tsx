import React from 'react';
let faSearch = require('svgs/faSearch.svg');

const styles = require('./Search.scss');

class SearchBox extends React.Component{

    constructor(props:any){
        super(props);
    }
    render(){
        return <div className={styles['search-wrapper']}>
            <div className={styles['search-area']}>
                <input type="text" placeholder="Search in the xxx"/>
                <button dangerouslySetInnerHTML={{__html:faSearch}}></button>
            </div>
        </div>
    }
}


export default SearchBox;