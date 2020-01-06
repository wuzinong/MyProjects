export interface IFormFieldProps {
    id: string;
    label?: string | JSX.Element;
    value?: any;
    isReadOnly?: boolean;
    onChange?: (event:any,item1?:any,item2?:any)=>any;
    showError?: boolean | null;
    errorMessage?: string | JSX.Element;
    showWarning?: boolean | null;
    warningMessage?: string | JSX.Element;
    showInfo?: boolean | null;
    infoMessage?: string | JSX.Element;
    withTip?:boolean;
    tipMsg?:string;
    isOptional?:boolean;
}