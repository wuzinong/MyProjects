import { IFormFieldProps } from "../FormField/FormField.types";

export interface RadioFieldProps extends IFormFieldProps {
    isChecked: boolean;
    value: string;
    name:string;
}