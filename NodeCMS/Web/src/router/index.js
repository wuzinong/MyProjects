import React from 'react'; 
import {HashRouter,BrowserRouter,Router,Route,Switch,Link,index,Redirect} from 'react-router-dom';
import asyncComponent from '../libs/AsuncComponents';
import Home from '../views/home'; 

import {Provider} from 'react-redux';
import store from '../store';


//If use dynamic load , the hot relacement function will not work. to be investigated
// const About = asyncComponent(()=>import('../views/about'));
// const NotFound = asyncComponent(()=>import('../views/notFound'));
// const List = asyncComponent(()=>import('../views/list'));
import About from '../views/about';
import NotFound from '../views/notFound';
import List from '../views/List';
import Login from '../views/login';

const App =()=>(
      <Provider store={store}>
        <HashRouter>
            <Switch>
                <Route exact path="/" component={Login} />
                 
                <Route pate="/home"
                       component = {Home}
                >
                </Route>
                <Route path="/about" 
                       component = {About}
                    >
                </Route>
                <Route path="/list" 
                       component = {List}
                    >
                </Route>
                <Route path="/notFound"
                      component = {NotFound}
                    >
                </Route>
                <Redirect exact path='*' to='/notFound'></Redirect>
            </Switch>
        </HashRouter>
   </Provider>
);

export default App;