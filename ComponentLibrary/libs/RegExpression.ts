export const emailReg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
export const lowerCaseReg = (num:number=1)=>{
    let reg = new RegExp(`[a-z]{${num},}`,"gm");
    return reg;
}
export const upperCaseReg = (num:number=1)=>{
    let reg = new RegExp(`[A-Z]{${num},}`,"gm");
    return reg;
}
export const numberReg = (num:number=1)=>{
    let reg = new RegExp(`[0-9]{${num},}`,"gm");
    return reg;
}
export const containReg = (str:string)=>{
    let reg = new RegExp(`${str}`,"gm");
    return reg;
}
