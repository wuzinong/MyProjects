import React, { FunctionComponent, useState, useEffect } from 'react';

import cn from 'classnames';
import { requiredValidator, requiredChecked, supportCountryValidator,socialDomainsValidator,emailValidator } from 'src/components/form/Validators/Validators';
import { useFormField, useForm, FormField } from 'hooks/useForm';
import TextField from 'src/components/form/TextField/TextField';
import HelperMessage from 'src/components/form/HelperMessage/HelperMessage';
import { HelperMessageType } from 'src/components/form/HelperMessage/HelperMessage.types';
import CheckboxField from 'src/components/form/CheckboxField/CheckboxField';
import SelectField from 'src/components/form/SelectField/SelectField';
import BrowserHelper from 'libs/BrowserHelper';
let styles = require('./Form.scss');

interface CreditCardFormProps {
    productSelection: { productId: string, productVariantKey: string, pricingPlanKey: string };
    onSubmitSuccess: () => void;
    onSubmitFailure: () => void;
    stripe: any;
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
        Aboutyou: { isOpen: true, isDisabled: false, isInitial: true } as CardHeaderProps,
        CompanyInformation: { isOpen: false, isDisabled: true, isInitial: true } as CardHeaderProps,
        PaymentDetails: { isOpen: false, isDisabled: true, isInitial: true } as CardHeaderProps
    });
    let [isCardPayment, setCardPayment] = useState(true);

    let [isSameAddress, setIsSameAddress] = useState(true);
    let [countryOptions, setCountryOptions] = useState([]);
    let [countryMobiles,setCountryMobiles] = useState([]);
    let [defaultCountryMobile,setDefaultCountryMobie] = useState(null);
    let [isModalOpen,setIsModalOpen] = useState(false);

    // useEffect(() => {
    //     BrowserHelper.scroll();
    //     (async () => {
    //         let countryOptions = await PromiseUtility.tryOrNull(requestService.getCountryOptions()) as any[];
    //         let temp = [];
    //         let tempCountryMobiles = [];

    //         for (let i = 0; i < countryOptions.length; i++) {
    //             if (countryOptions[i]["sellTo"]) {
    //                 temp.push({
    //                     label: countryOptions[i]["name"],
    //                     value: countryOptions[i]["countryCode"]
    //                 });
    //                 tempCountryMobiles.push({
    //                     imageUrl:countryOptions[i]["imageUrl"],
    //                     countryCode: countryOptions[i]["countryCode"],
    //                     callingCode:countryOptions[i]["callingCode"],
    //                     name: countryOptions[i]["name"],
    //                 });
    //             }
    //         }
    //         temp.sort((a,b)=>{return a.label.localeCompare(b.label)});
    //         tempCountryMobiles.sort((a,b)=>{return a.name.localeCompare(b.name)});
    //         temp.splice(0,0,{
    //             label: 'Select the country',
    //             value: ''
    //         });
    //         setCountryOptions(temp);
    //         setCountryMobiles(tempCountryMobiles);
    //         setDefaultCountryMobie({
    //             imageUrl:tempCountryMobiles[0]["imageUrl"],
    //             countryCode: tempCountryMobiles[0]["countryCode"],
    //             callingCode:tempCountryMobiles[0]["callingCode"]
    //         });
    //     })();
    // }, []);

    let aboutYouForm = useForm({
        firstName: useFormField('', [requiredValidator('Please enter your first name.')]),
        lastName: useFormField('', [requiredValidator('Please enter your last name.')]),
        email: useFormField('', [emailValidator('Please enter a valid email.'),socialDomainsValidator('Social email domains are not accepted, please use your company email. If you are an existing user please change your email address on your user profile page.',["abc"])]),
        // mobile: useFormField('', [mobileValidator('Please enter your phone number.')]),
        optInTerms: useFormField(false, [requiredChecked('In order to proceed, you must agree to the Terms of use and the Privacy statement.')]),
        optInVVTest: useFormField(false, [])
    });



    let fields = {
        firstName: toFieldProps(aboutYouForm.fields.firstName),
        lastName: toFieldProps(aboutYouForm.fields.lastName),
        email: toFieldProps(aboutYouForm.fields.email),
        // mobile: toMobileProps(aboutYouForm.fields.mobile),
        optInTerms: toCheckFieldProps(aboutYouForm.fields.optInTerms),
        optInVVTest: toCheckFieldProps(aboutYouForm.fields.optInVVTest)
    };
    function toMobileProps<T>(field:FormField<T>){
        return {
            value: field.value,
            onChange: (val,callingCode,countryCode) => {
                let tempCountryCode = countryCode?countryCode:defaultCountryMobile.countryCode;
                field.setParams([tempCountryCode]);
                return field.setValue(val);
            },
            showError: field.validationState === 'error',
            errorMessage: firstIssueOrDefault(field)
        };
    }
    function toFieldProps<T>(field: FormField<T>) {
        return {
            value: field.value,
            onChange: (event) => field.setValue(event.target.value),
            showError: field.validationState === 'error',
            errorMessage: firstIssueOrDefault(field)
        };
    }

    function toCheckFieldProps(field: FormField<boolean>) {
        return {
            ...toFieldProps(field),
            onChange: (event) => field.setValue(!field.value),
            isChecked: field.value
        };
    }

    function firstIssueOrDefault<T>(field: FormField<T>, defaultMessage: string = ''): string {
        if (field.issues && field.issues.length > 0)
            return field.issues[0].message;
        return defaultMessage;
    }
 
    async function submit(event: any) {
 
    }

    async function submitPayment(paymentMethodId: string, paymentIntentId: string = undefined): Promise<any> {
    
    }
 
    const getCountryName = (countryCode:string)=>{
        if(countryCode == ""){
            return "";
        }
        let result = countryOptions.filter((item)=>{
            return item.value === countryCode
        });
        return result && result[0].label;
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
                    {/* <div className="row">
                        <div className={cn('field', 'col-md-7')}>
                            <MobileField 
                                id="" 
                                label="Phone number" 
                                {...fields.mobile} 
                                countryList={countryMobiles} 
                                defaultCountry={defaultCountryMobile}
                                withTip={true}
                                tipMsg="Phone number used in your own country."
                            />
                        </div>
                    </div> */}

                    <div className="row">
                        <div className={cn('field', 'col-md-12')}>
                            <CheckboxField id="opt-terms" label={<span>I agree to the <a target="_blank" href={``}>aaa</a> and <a target="_blank" href={`/PrivacyStatement`}>ddd.</a> (Required)</span>}
                                {...fields.optInTerms} />
                        </div>
                    </div>

                    <div className="row">
                        <div className={cn('field', 'col-md-12')}>
                            <CheckboxField id="opt-veracity" label="Yes, I agree to receiving news and information related to VVTest, and I know that I can opt out later."
                                {...fields.optInVVTest} />
                        </div>
                    </div>

                    <hr className={cn(styles['line'], styles['line-margin-large'])} />

                    <div className="row">
                        <div className={cn("col-md-12", styles['btn-group'])}>
                            <div className={cn(styles['btn-section'])}>
                                <button onClick={()=>{setIsModalOpen(true)}}>Cancel</button>
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