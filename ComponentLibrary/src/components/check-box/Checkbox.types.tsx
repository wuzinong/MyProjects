export interface ICheckboxProps {
    isDisabled?: boolean;
    isChecked: boolean;
    fieldName: string;
    onChange: (name: string, isChecked: boolean) => void;
}

export interface ICheckboxStates {
    isChecked: boolean;
}