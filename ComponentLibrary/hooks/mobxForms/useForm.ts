import * as React from 'react';
import { useLocalStore, useObserver } from 'mobx-react'
import { observable, computed } from 'mobx';
import { Validator } from 'src/components/form/Validators/Validators.types';


export interface FormFieldMessage {
    text: string;
    type?: 'error' | 'warning' | 'info';
}

export interface Issue {
    type: 'info' | 'warning' | 'error' | 'initError';
    message: string;
}

/** The current state of the field, deduced from the issues returned by the form's validators. */
export type FieldValidationState = 'valid' | 'warning' | 'error' | 'initError';

export interface IFormField<T> {

    /** The initial value of this field. */
    value: T;

    /** The field's validation state (just a convenience, derived from the list of issues) */
    validationState: FieldValidationState;

    /** List of issues generated by running the current value through the field's validators */
    issues: Issue[];

    /** Has the field been interacted with yet? */
    touched: boolean;

    isValid: boolean;

    params: string[];
    /** A function that takes in the field's value, and returns the validation errors to be displayed. */
    validators: Validator<T>[];
}

interface IFieldParams<T> {
    /** The initial value of this field. */
    initialValue: T;

    /** A function that takes in the field's value, and returns the validation errors to be displayed. */
    validators: Validator<T>[];
}
export class FormField<T> implements IFormField<T>{
    @observable public validators: Validator<T>[];
    @observable public issues: Issue[] = [];
    @observable public params: string[] = [];
    @observable public touched: boolean = false;
    @observable public value: T;
    @observable public validationState = null;
    @observable public isValid = true;


    constructor(obj: IFieldParams<T>) {
        this.value = obj.initialValue;
        this.validators = obj.validators;
    }

    static init<T>(initialValue: any, validators: Validator<T>[]) {
        if(initialValue == null) 
            initialValue='';
        return new FormField<T>({ initialValue, validators });
    }

    /** The validation messages to display along with the field */
    getIssues() {
        this.issues = [];
        if (this.touched) {
            this.validators.forEach(validator => {
                let validationResult = validator.validate(this.value, this.params);
                if (!validationResult.isValid) {
                    this.isValid = false;
                    this.issues.push({ type: 'error', message: validationResult.message.toString() });
                }
            });
        } else {
            //Handle init error
            this.validators.forEach(validator => {
                let validationResult = validator.validate(this.value, this.params);
                if (!validationResult.isValid) {
                    this.isValid = false;
                    this.issues.push({ type: 'initError', message: validationResult.message.toString() });
                }

            });
        }
        if (this.issues.some(x => x.type == 'error'))
            this.validationState = 'error';
        else if (this.issues.some(x => x.type == 'warning'))
            this.validationState = 'warning';
        else if (this.issues.some(x => x.type == 'initError'))
            this.validationState = 'initError'
        else
            this.validationState = 'valid';
        return this.issues;
    }

    // @computed get isValid(): boolean {
    //   return this.issues.filter(x => x.type == 'error' || x.type == 'initError').length == 0;
    // }

}

/** The result of trying to submit the form. */
interface ISubmitResult {
    values: any;
    success: boolean;
    failReason?: 'VALIDATION_FAILED' | 'ALREADY_SUBMITTED';
}

interface IForm {
    /** The FormFields making up the form */
    fields: Record<string, FormField<any>>;
    submit: () => ISubmitResult;
    /** Has the form been successfully submitted? If so, you can't submit again. */
    submitted: boolean;
    /** Are all the fields valid? (State is not 'error') */
    allFieldsAreValid: boolean;
}

export class CommonForm implements IForm {
    @observable public fields;
    @observable public submitted = false;
    @observable allFieldsAreValid = false;
    constructor(fields: Record<string, FormField<any>>) {
        this.fields = fields;
        this.allFieldsAreValid = !Object.values(fields).some(field => field.validationState == 'error' || field.validationState == 'initError');
    }

    submit = (): ISubmitResult => {

        // Touch all fields upon try submit, so they show their validation.
        Object.values(this.fields).forEach(field => {
            field.touched = true;
            field.getIssues();
        });
        this.allFieldsAreValid = !Object.values(this.fields).some(field => field.validationState == 'error' || field.validationState == 'initError');
        if (this.submitted) {
            return {
                values: null,
                success: false,
                failReason: 'ALREADY_SUBMITTED'
            }

        } else if (!this.allFieldsAreValid) {
            return {
                values: null,
                success: false,
                failReason: 'VALIDATION_FAILED'
            }

        } else {
            this.submitted = true;

            let values = {};
            Object.keys(this.fields).forEach(key => values[key] = this.fields[key].value);
            return {
                values,
                success: true
            }
        }
    }

}