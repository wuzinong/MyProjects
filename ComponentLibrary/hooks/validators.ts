/**
 * Generic validators for use with useFormField, that take in a form value and
 * return a list of _Issue_ objects.
 */

import {Validator} from './useForm';

export const validateEmail: Validator<string> = str => {
  let issues = [];

  if (!str.includes('@')){
    issues.push({
      type: 'error',
      message: 'Not valid. Email addresses should contain the @ symbol...'
    })
  }

  if (str.length > 15){
    issues.push({
      type: 'warning',
      message: `This email address is really long, that's weird`
    })
  }

  return issues;
}

export const validateUsername: Validator<string> = str => {
  let issues = [];

  if (str.length < 5){
    issues.push({
      type: 'error',
      message: `Oops, username should be at least 5 characters`
    })
  }

  return issues;
}