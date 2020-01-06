import { IFormFieldProps } from "../FormField/FormField.types";

export interface SelectFieldProps extends IFormFieldProps {
    options: IOptionType[];
    onChange?: React.ChangeEventHandler<HTMLSelectElement> | null;
    shouldDisable?:boolean;
}

interface IOptionType{
    label: string,
    value: string
}
