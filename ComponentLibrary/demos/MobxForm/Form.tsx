import React, { useEffect,useMemo } from 'react';
import { FormState,formStep } from './Form.state';
import { useLocalStore, useObserver, observer, Observer } from 'mobx-react';
import {TextInput} from 'FlexComponents/TextInput/TextInput';
import { ValidationState, FormWithSteps, FormFieldGroup,FormField } from '../../hooks/mobxForms/forms.state';

const Form = ()=>{
    let state = useLocalStore<FormState>(() => new FormState());


    const FieldMessagesPartial: React.FC<{ field: FormField<any> }> = observer(props => <>
        {(() => {
          if (props.field.messages.length > 0)
            return props.field.messages.map((msg, i) => <div key={i} >{msg.content}</div>);
      
          else if (props.field.hint)
            return <div>{props.field.hint}</div>;
      
          else
            return <></>;
        })()}
      </>);

    const TextInputPartial: React.FC<{ field: FormField<string>, isDisabled?: boolean }> = observer(({ field, isDisabled }) => <>
        <TextInput
            state={field.state == ValidationState.Invalid ? 'invalid' : null}
            onChange={ev => { field.value = ev.target.value }}
            value={field.value}
            id={field.id}
            onBlur={async (ev) => { 
                field.injectedMessages=[];
                let isValid = field.validate(); 
            }}
            style={{ maxWidth: '400px' }}
            disabled={isDisabled}
            onFocus={() => {  }}
        />
        <FieldMessagesPartial field={field} />
    </>);

    return <div style={{width:"600px",margin:"0 auto"}}>
        <h1>Group1</h1>
        <dl>
            <dt><label htmlFor="">First name</label></dt>
            <dd>
                <TextInputPartial key="firstName" field={state.fields.firstName}/>
            </dd>
        </dl>
        <button onClick={() => {
                                //   if (state.form.steps[0].fieldGroup.validate()) {
                                //                 state.submit();
                                //             }
                                state.form.goToNextStep()
                                        }}
        >go to next group</button>

        <h1>Group2</h1>
        <dl>
            <dt><label htmlFor="">First name</label></dt>
            <dd>
                <TextInputPartial key="lastName" field={state.fields.lastName}/>
            </dd>
        </dl>
    </div>
}

export default Form;