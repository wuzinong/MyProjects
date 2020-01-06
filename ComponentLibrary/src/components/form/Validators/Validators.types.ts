export interface Validator<T> {
    invalidMessage: string;
    validate: (value: T,params?:any[]) => ValidationResult;
}

export interface ValidationResult {
    isValid: boolean;
    message?: string | JSX.Element | null;
}