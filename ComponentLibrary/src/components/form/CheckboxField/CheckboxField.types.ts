import { IFormFieldProps } from "../FormField/FormField.types";

export interface CheckboxFieldProps extends IFormFieldProps {
    isChecked: boolean;
    value: boolean;
}