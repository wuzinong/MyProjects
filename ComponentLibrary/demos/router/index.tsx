import React from 'react';
import asyncComponent from 'libs/AsyncComponents';
import { HashRouter, BrowserRouter, Router, Route, Switch, Redirect } from 'react-router-dom';
const Home = asyncComponent(() => import('../home/Home'));
const Form = asyncComponent(() => import('../form/Form'));
const MobxForm = asyncComponent(() => import('../MobxForm/Form'));
const FlexComponents = asyncComponent(()=>import('../FlexComponents/FlexComponents'));

const ContentFullLayout = (component: any) => {
    return (
            <div className="vui-container">
                {component}
            </div>
    );
}

class App extends React.Component {
    debugger;
    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route path="/home" render={() => ContentFullLayout(<Home />)} />
                    <Route path="/form" render={() => ContentFullLayout(<Form />)} />mobxform
                    <Route path="/mobxform" render={() => ContentFullLayout(<MobxForm />)} />
                    <Route path="/flexComponents" render={() => ContentFullLayout(<FlexComponents />)} />
                    <Redirect exact path="/" to="/home"></Redirect>
                    <Redirect exact path="*" to="/not-found"></Redirect>
                </Switch>
            </BrowserRouter>
        )
    }
}

export default App;