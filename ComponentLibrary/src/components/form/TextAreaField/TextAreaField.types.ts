import { IFormFieldProps } from "../FormField/FormField.types";

export interface TextAreaFieldProps extends IFormFieldProps {
    rows?: number;
    onChange?: React.ChangeEventHandler<HTMLTextAreaElement> | null;
}