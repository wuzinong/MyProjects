export interface HelperMessageProps {
    children: string | JSX.Element;
    type: HelperMessageType;
}

export enum HelperMessageType {
    Error = 'error',
    Warning = 'warning',
    Info = 'info',
    Success = 'success',
    Default = 'default'
}