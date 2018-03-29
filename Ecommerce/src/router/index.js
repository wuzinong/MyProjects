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
// const Details = asyncComponent(()=>import('../views/details'));
// const Cart = asyncComponent(()=>import('../views/cart'));
import About from '../views/about';
import NotFound from '../views/notFound';
import List from '../views/List';
import Details from '../views/details';
import Cart from '../views/cart';
import Intermediate from '../views/intermediate';
import Checkout from '../views/checkout';
import Confirmation from '../views/confirmation';

const App =()=>(
      <Provider store={store}>
        <BrowserRouter>
            <Switch>
                <Route exact path="/" component={Home} >
                 
                </Route>
                <Route path="/about" 
                       component = {About}
                    >
                </Route>
                <Route path="/list" 
                       component = {List}
                    >
                </Route>
                <Route path="/details"
                       component = {Details}
                >
                </Route>
                <Route path="/cart"
                       component={Cart}
                >
                </Route>
                <Route path="/intermediate"
                       component={Intermediate}
                >
                </Route>
                <Route path="/checkout"
                       component={Checkout}   
                >
                </Route>
                <Route path="/confirmation"
                       component = {Confirmation}
                >
                </Route>
                <Route path="/notFound"
                      component = {NotFound}
                    >
                </Route>
                <Redirect exact path='*' to='/notFound'></Redirect>
            </Switch>
        </BrowserRouter>
      </Provider>
);

export default App;