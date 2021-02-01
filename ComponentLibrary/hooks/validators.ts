/**
 * Generic validators for use with useFormField, that take in a form value and
 * return a list of _Issue_ objects.
 */

import {Validator} from './validators.types';


export const requiredValidator = (invalidMessage: string = 'Value is required.'): Validator<string> => {
  return {
      invalidMessage: invalidMessage,
      validate: (value: string) => {
          let isEmpty = typeof value === 'undefined' || value === null || value === '';
          return { isValid: !isEmpty, message: invalidMessage };
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
