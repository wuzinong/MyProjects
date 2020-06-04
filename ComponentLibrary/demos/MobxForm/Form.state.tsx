import React from 'react';
import { observable, computed } from 'mobx';
import { IValidationMessage, FormWithSteps, FormFieldGroup,FormField } from '../../hooks/mobxForms/forms.state';


export enum formStep {
    aboutYou='aboutyou',
    companyDetails='companyDetails',
    payment='payment'
}

export class FormState{
    @observable fields:any = null;
    @observable form: FormWithSteps;
    @observable showLoading = false;

    constructor(){
        let fieldsCollection = {
            firstName: new FormField({
                name: 'First name',
                initialValue: '',
                id: 'firstName',
                validator: field => {
                    let messages: IValidationMessage[] = [];
                    if (field.value.length == 0) {
                        messages.push({ type: 'error', content: <span>First name is required.</span> })
                    };
                    return messages;
                }
            }),
            lastName: new FormField({
                name: 'Last name',
                initialValue: '',
                id: 'lastName',
                validator: field => {
                    let messages: IValidationMessage[] = [];
                    if (field.value.length == 0) messages.push({ type: 'error', content: <span>Last name is required.</span> });
                    return messages;
                }
            })
        }
        this.fields = {
            ...fieldsCollection
        };
        
        let formSteps = new FormWithSteps([
            {
                name: formStep.aboutYou,
                fieldGroup: new FormFieldGroup([
                    this.fields.firstName
                ])
            },
            {
                name: formStep.companyDetails,
                fieldGroup: new FormFieldGroup([
                    this.fields.lastName
                ])
            },
        ]);

        this.form = formSteps;

    }

     /** An object with the values of all the fields */
     @computed get fieldValues(): Record<string, string> {
        let result = {};
        Object.keys(this.fields).forEach(key => { result[key] = this.fields[key].value });
        return result;
    }

    async submit() {
        try {
           
            let submitParams: any = { ...this.fieldValues as any };
            
            console.log("is valid:",this.form.steps[0].fieldGroup.validate())
             
            console.log("submitParams:",submitParams)
            
        } catch (err) {
            this.showLoading = false;
            console.error('Erro, err')
        }
    }
}

