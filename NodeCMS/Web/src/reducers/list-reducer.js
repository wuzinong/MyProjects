import axios from 'axios';

const initListInfo = {
        listData:[]
}

const ListReducer = (state=initListInfo,action)=>{
    switch (action.type) {
        case 'init_list':{
            const {list} = action;
            initListInfo.listData = list;
            let newList = {
                listData:list
            }
            return Object.assign({},state,newList);
        }
        case 'filter_list':{
            const {name} = action; 
            let arr = initListInfo.listData.filter(item=>item.indexOf(name)>=0);

            return Object.assign({},state,{listData:arr});
        }
        default:
           return state
    }
}

const getList = (list)=>({
    type:'init_list',
    list
});

const filterList = (name)=>({
    type:'filter_list',
    name
});

const getData =()=> dispatch=>{
     axios.get("http://127.0.0.1:10010/data").then((response)=>{
         dispatch(getList(response.data));
    });
    // const list = await axios.get("http://127.0.0.1:10010/data").then((response)=>{
    //     return response.data;
    // });
    // dispatch(getList(list));
}

const filterData = (name)=>dispatch=>{
    dispatch(filterList(name));
}

export {
    ListReducer,
    getData,
    filterData
 }