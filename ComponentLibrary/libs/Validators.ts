import { emailReg } from 'libs/RegExpression';

export const validators: any = {
    condition: (value: any, invalid: (v: any) => boolean, message: string) => {
        if (invalid(value))
            return {
                value,
                isValid: false,
                message: message
            };
        return { 
            value,
            isValid: true,
            message 
        };
    },
    required: (value: any, message: string) =>
        validators.condition(value, (v: any) => v === '' || v == null, message),
    minLength: (value: any, count: number, message: string) =>
        validators.condition(value, (v: any) => (v.length < count), message),
    maxLength: (value: any, count: number, message: string) =>
        validators.condition(value, (v: any) => (v.length > count), message),
    regex: (value: any, expression: RegExp, message: string) =>
        validators.condition(value, (v: any) => !expression.test(v), message),
    email: (value: any, message: string) =>
        validators.regex(value, emailReg, message),
    passwordNotEqual: (value1:string,value2:string,message:string) =>
        validators.condition(value1, (v:string) => {
           let passVlidation = false;
           if(v=="" || value2==""){
               passVlidation = true;
           }
           passVlidation = (v !== value2);
           return passVlidation;
        },message),
    equal:(value1:string,value2:string,message:string,revertEqual:boolean=false,ignore:boolean=true)=>
        validators.condition(value1,(v:string)=>{
            let passVlidation = false;
            if(ignore){
                passVlidation = (v.toLowerCase() == value2.toLowerCase());
            }else{
                passVlidation = (v == value2);
            }
            if(revertEqual){
                passVlidation = !passVlidation;
            }
            return passVlidation;
        },message)
}