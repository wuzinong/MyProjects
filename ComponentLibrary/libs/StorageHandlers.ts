export const setSessionItem = (key:string,value:object)=>{
    sessionStorage.setItem(key,JSON.stringify(value));
}

export const getSessionItem = (key:string):object=>{
    if(!sessionStorage.getItem(key)){
        return null;
    }else{
        return JSON.parse(sessionStorage.getItem(key)); 
    }
}

export const setLocalItem = (key:string,value:object)=>{
    localStorage.setItem(key,JSON.stringify(value));
}

export const getLocalItem = (key:string):object=>{
    if(!localStorage.getItem(key)){
        return null;
    }else{
        return JSON.parse(localStorage.getItem(key)); 
    }
}

export const removeLocalItem = (key:string):boolean=>{
    let result = false;
    for(let objKey in localStorage){
        if(objKey.indexOf(key) >= 0 ){
            localStorage.removeItem(objKey);
            result = true;
        }
    }
    return result;
}