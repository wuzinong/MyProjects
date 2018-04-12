const initCart = {
    text:"this is an example"
}

//reducer
const CartReducer = (state=initHome,action)=>{
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
    CartReducer,
   changeInfo
}