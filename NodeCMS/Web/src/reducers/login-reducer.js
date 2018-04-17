const initLogin={
    ifLogin:false,
    code:0,
    message:""
}

const LoginReducer = (state=initLogin,action)=>{
    switch (action.type) {
        case "LOGIN": {
            
            return Object.assign({},initLogin,{ifLogin:true,code:1,message:"log in succeed"});
        }
        default : return state;
    }
}

const LoginFunc = (info)=>({
    type:"LOGIN",
    info:info
});

export {
    LoginReducer,
    LoginFunc
 }