import React from 'react';
import {Checkbox,EyeInput} from 'Components';
class Home extends React.Component{
    constructor(props:any){
        super(props)
    }
    render(){
        return <main>
            <h1 className="page-title">Common component library</h1>
            <h2>Checkbox</h2>
            <Checkbox
                fieldName={"test"}
                isChecked={false}
                onChange = {()=>{}}
                isDisabled = {false}
            />
            <br/>
            <Checkbox
                fieldName={"test"}
                isChecked={true}
                onChange = {()=>{}}
                isDisabled = {false}
            />
            <br/>
            <Checkbox
                fieldName={"test2"}
                isChecked={false}
                onChange = {()=>{}}
                isDisabled = {true}
            />
            <br/>
            <Checkbox
                fieldName={"test2"}
                isChecked={true}
                onChange = {()=>{}}
                isDisabled = {true}
            />
            <h2>Eye input</h2>
            <EyeInput/>
        </main>
    }
}

export default Home;