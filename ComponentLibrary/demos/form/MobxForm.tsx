import React, { FunctionComponent, useState, useEffect } from 'react';

import cn from 'classnames';
import { requiredValidator, requiredChecked, supportCountryValidator,socialDomainsValidator,emailValidator } from 'src/components/form/Validators/Validators';
import { useFormField, useForm, FormField } from 'hooks/useForm';
import { FormField as Field, CommonForm, IFormField } from 'hooks/mobxForms/useForm';
import TextField from 'src/components/form/TextField/TextField';
import HelperMessage from 'src/components/form/HelperMessage/HelperMessage';
import { HelperMessageType } from 'src/components/form/HelperMessage/HelperMessage.types';
import CheckboxField from 'src/components/form/CheckboxField/CheckboxField';
import SelectField from 'src/components/form/SelectField/SelectField';
import BrowserHelper from 'libs/BrowserHelper';
import { useLocalStore, observer } from 'mobx-react';
let styles = require('./Form.scss');

interface CreditCardFormProps {
    checkoutInfo?:any;
}

interface CardHeaderProps {
    isOpen: boolean;
    isDisabled: boolean;
    type?: CardTitle;
    isInitial?: boolean;
}
enum CardTitle {
    Aboutyou='Aboutyou',
    CompanyInformation='CompanyInformation',
    PaymentDetails='PaymentDetails'
}

const CreditCardForm: FunctionComponent<CreditCardFormProps> = (props: CreditCardFormProps) => {
    let [CardState, setCardState] = useState({
        Aboutyou: { isOpen: true, isDisabled: false, isInitial: true } as CardHeaderProps
    });

    let aboutYouForm = useLocalStore(() => new CommonForm({
        firstName: Field.init(props.checkoutInfo.firstName, [requiredValidator('Please enter your first name.')]),
        lastName: Field.init(props.checkoutInfo.lastName, [requiredValidator('Please enter your last name.')]),
        email: Field.init(props.checkoutInfo.email, [emailValidator('Please enter a valid email.'), socialDomainsValidator('Social email domains are not accepted, please use your company email. If you are an existing user please change your email address on your user profile page.', ["test","test2"])]),
        optInTerms: Field.init(props.checkoutInfo.optInTerms, [requiredChecked('In order to proceed, you must agree to the Terms of use and the Privacy statement.')]),
        optInVVTest: Field.init(false, [])
    }));




    let fields = {
        firstName: toFieldProps(aboutYouForm.fields.firstName),
        lastName: toFieldProps(aboutYouForm.fields.lastName),
        email: toFieldProps(aboutYouForm.fields.email),
        // mobile: toMobileProps(aboutYouForm.fields.mobile),
        optInTerms: toCheckFieldProps(aboutYouForm.fields.optInTerms),
        optInVVTest: toCheckFieldProps(aboutYouForm.fields.optInVVTest)
    };
    function toFieldProps<T>(field: IFormField<T>) {
        return {
            value: field.value,
            onChange: (event) => {
                field.touched = true;
                field.value = event.target.value;
                field.getIssues();
            },
            showError: field.validationState === 'error',
            errorMessage: firstIssueOrDefault(field)
        };
    }

    function toCheckFieldProps(field: IFormField<boolean>) {
        return {
            ...toFieldProps(field),
            onChange: (event) => {
                field.touched = true;
                field.value = !field.value;
                field.getIssues();
            },
            isChecked: field.value
        };
    }

    function firstIssueOrDefault<T>(field: IFormField<T>, defaultMessage: string = ''): string {
        if (field.issues && field.issues.length > 0)
            return field.issues[0].message;
        return defaultMessage;
    }
 
   

    const updateCardSection = (toEle: CardTitle) => {
        aboutYouForm.submit();
    }

 
    return (
        <>
            <div className={cn(styles['reset-margin'])}>
                <div className={cn(styles["card-section"], CardState.Aboutyou.isOpen ? styles["open"] : "")}>
                    <div className="row">
                        <div className={cn('field', 'col-md-7')}>
                            <TextField id="first-name" label="First name" {...fields.firstName} />
                        </div>
                    </div>
                    <div className="row">
                        <div className={cn('field', 'col-md-7')}>
                            <TextField id="last-name" label="Last name" {...fields.lastName} />
                        </div>
                    </div>
                    <div className="row">
                        <div className={cn('field', 'col-md-7')}>
                            <TextField id="email" label="Email address" {...fields.email} />
                        </div>
                    </div>

                    <div className="row">
                        <div className={cn('field', 'col-md-12')}>
                            <CheckboxField id="opt-terms" label={<span>I agree to the <a target="_blank" href={``}>aaa</a> and <a target="_blank" href={`/PrivacyStatement`}>ddd.</a> (Required)</span>}
                                {...fields.optInTerms} />
                        </div>
                    </div>

                    <div className="row">
                        <div className={cn('field', 'col-md-12')}>
                            <CheckboxField id="opt-veracity" label="yes I agree."
                                {...fields.optInVVTest} />
                        </div>
                    </div>

                    <hr className={cn(styles['line'], styles['line-margin-large'])} />

                    <div className="row">
                        <div className={cn("col-md-12", styles['btn-group'])}>
                            <div className={cn(styles['btn-section'])}>
                                <button >Cancel</button>
                                <button onClick={() => { updateCardSection(CardTitle.CompanyInformation) }}>Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CreditCardForm;