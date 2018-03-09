const initDetails = {
    text:"details"
}

//reducer
const DetailReducer = (state=initDetails,action)=>{
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
    DetailReducer,
    changeInfo
};