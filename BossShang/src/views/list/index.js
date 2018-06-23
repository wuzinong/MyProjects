import React from 'react';
import {connect} from 'react-redux';
import {getData,filterData} from '../../reducers/list-reducer';
import ListComponent from './list-component';

const mapDispatchToProps = (dispatch,props)=>{
    const initList = ()=>{
        dispatch(getData());
    }
    const filterList = (name)=>{
        dispatch(filterData(name));
    }
    
    return {
        initList,
        filterList
    }
}
const mapStateToProps = (state)=>{
    const {listData} = state.ListReducer;
    return {
        listData:listData
    }
}

const List = connect(
    mapStateToProps,
    mapDispatchToProps
)(ListComponent);
export default List;