export interface ICheckboxProps {
    labelText: string;
    name: string;
    isChecked:boolean;
    checkboxChange: (name: string,newState:boolean, event: any) => void;
}

export interface ICheckboxState{
    isChecked:boolean;
}