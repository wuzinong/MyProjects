import { Validator } from "./Validators.types";
// import PhoneNumber from 'awesome-phonenumber';


export const requiredValidator = (invalidMessage: string = 'Value is required.'): Validator<string> => {
    return {
        invalidMessage: invalidMessage,
        validate: (value: string) => {
            let isEmpty = typeof value === 'undefined' || value === null || value === '';
            return { isValid: !isEmpty, message: invalidMessage };
        }
    }
}

export const supportCountryValidator = (invalidMessage: string = 'Value is required.'): Validator<string> => {
    return {
        invalidMessage: invalidMessage,
        validate: (value: string) => {
            let availableCountryList = ['AU', 'AT', 'BE', 'BG', 'CA', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'CN', 'GR', 'HU', 'IS', 'IE', 'IT', 'JP', 'KR', 'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'NZ', 'PL', 'PT', 'RO', 'SG', 'SK', 'SI', 'ES', 'SE', 'CH', 'GB', 'AE', 'US'];
            return { isValid: (availableCountryList.indexOf(value) >= 0), message: invalidMessage };
        }
    }
}

// export const mobileValidator = (invalidMessage: string = 'Value is required.'): Validator<string> => {
//     return {
//         invalidMessage: invalidMessage,
//         validate: (value: string) => {
//             let pn = new PhoneNumber(value);
//             return { isValid: pn.isValid(), message: invalidMessage };
//         }
//     }
// }

export const socialDomainsValidator = (invalidMessage: string = 'Value is required.', domainList: Array<string>): Validator<string> => {
    return {
        invalidMessage: invalidMessage,
        validate: (value: string) => {
            let result = true;
            let temp = value.split('@');
            if (temp.length > 1 && domainList && domainList.length > 0) {
                if (domainList.indexOf(temp[1] + ";") >= 0) {
                    result = false;
                }
            }
            return { isValid: result, message: invalidMessage };
        }
    }
}

export const requiredChecked = (invalidMessage: string = 'Value is required.'): Validator<boolean> => {
    return {
        invalidMessage: invalidMessage,
        validate: (value: boolean) => {
            let isChecked = value === true;
            return { isValid: isChecked, message: invalidMessage };
        }
    }
}

export const regexValidator = (regex: RegExp, invalidMessage: string = 'Value is not valid.'): Validator<string> => {
    return {
        invalidMessage,
        validate: (value: string) => {
            return { isValid: regex.test(value), message: invalidMessage };
        }
    }
}

export const emailValidator = (invalidMessage: string = 'Value is not a valid email.'): Validator<string> => {
    return regexValidator(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i, invalidMessage);
}