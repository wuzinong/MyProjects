const initHome = {
    text:"this is an example"
}

//reducer
const HomeReducer = (state=initHome,action)=>{
    switch (action.type){
        case "CHANGE_INFO":
            return Object.assign({},state,{text:action.text});
        default:
            return state
    }
}

//actions
const changeInfo = (info)=>({type:'CHANGE_INFO',info});

export {
   HomeReducer,
   changeInfo
}