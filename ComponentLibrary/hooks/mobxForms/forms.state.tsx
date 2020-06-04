import { observable, computed } from "mobx";
import React from 'react';

export type Validator<T> = (value: FormField<T>) => any[];

export interface IValidationMessage {
  type: 'error' | 'warning' | 'info',
  content: JSX.Element
}

export enum ValidationState {
  Pristine,
  Invalid,
  Validated,
}

export interface FormFieldParams<T> {
  /** A human-readable name for the field. */
  name?: string;

  /** A short hint for helping the user input data (typically displayed below, where the validation messages go). */
  hint?: React.ReactNode;

  /** The value to which the field is initialized. */
  initialValue: T;

  isFromServer?:boolean;

  id?:string;
  
  isDynamic?:boolean;
  type?:string;
  labelName?:string;
  placement?:string;
  injectedMessages?:IValidationMessage[];
  /** A function that when validation is called will run on the field and return a set of validation messages.
   * If there are no `error` messages, the field is considered valid.
   */
  validator: Validator<T>;
}

/** Mobx datastructure for a form with validation logic. */
export class FormField<T> {

  @observable name: string;
  @observable hint: React.ReactNode;

  @observable validator: Validator<T>;
  @observable value: T;
  @observable state: ValidationState = ValidationState.Pristine;
  @observable messages: IValidationMessage[] = [];
  @observable isFromServer:boolean = false;
  @observable id:string;
  @observable isDynamic = false;
  @observable type:string = '';
  @observable labelName:string='';
  @observable placement:string='';
  @observable injectedMessages:IValidationMessage[] = [];

  constructor(params: FormFieldParams<T>) {
    this.name = params.name;
    this.value = params.initialValue;
    this.validator = params.validator;
    this.isFromServer = false;
    this.id = params.id;
    this.isDynamic = params.isDynamic?params.isDynamic:false;
    this.type = params.type?params.type:'';
    this.labelName = params.labelName?params.labelName:'';
    this.placement = params.placement?params.placement:'';
    if (params.hint) this.hint = params.hint;
  }

  /** Run validation on the field, then return whether it was valid */
  validate(): boolean {

    this.messages = [...this.injectedMessages,...this.validator(this)];
    
    this.state = this.messages.some(msg => msg.type == 'error')
      ? ValidationState.Invalid
      : ValidationState.Validated;

    return this.state == ValidationState.Validated;
  }

  resetState() {
    this.state = ValidationState.Pristine;
  }
}


/** Mobx datastructure for a group of form fields. Makes it easy to run validation on all of the fields at once. */
export class FormFieldGroup {

  @observable fields: FormField<any>[];

  constructor(fields: FormField<any>[]) {
    this.fields = fields;
  }

  /** Run validation on all fields, then return whether all fields are valid */
  validate(): boolean {
    this.fields.forEach(field => field.validate());
    return (!this.fields.some(field => {
      return field.messages.some(msg => msg.type == 'error');
    }));
  }
}

/** Mobx datastructure for a form with several steps that must be input and validated in order. */
export interface FormStep {
  name: string;
  fieldGroup: FormFieldGroup;
}

export class FormWithSteps {
  @observable steps: FormStep[];
  @observable currentStep = 0;

  constructor(steps: FormStep[]) {
    this.steps = steps;
  }

  @computed get hasNextStep(): boolean {
    return this.currentStep < this.steps.length-1;
  }

  /** Run validation on current step's fields, and proceed to next step if all fields are valid.
   *  Returns true if successful.
   */
  goToNextStep(): boolean {
    if (!this.hasNextStep) throw new Error('There is no next step.');

    if (this.steps[this.currentStep].fieldGroup.validate()){
      this.currentStep++;
      return true;
    } else {
      return false;
    }
  }
}