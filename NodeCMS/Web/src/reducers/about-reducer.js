const initAbout = {
    textAbout:"this text from About Component"
}

//reducer
const AboutReducer = (state=initAbout,action)=>{
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
    AboutReducer,
    changeInfo
}