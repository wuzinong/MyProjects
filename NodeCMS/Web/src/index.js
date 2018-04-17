import React from 'react';
import ReactDOM from 'react-dom';
import Home from './views/home/index.js';
import App from './router/index.js';
import {AppContainer} from 'react-hot-loader';
import resetCss from './assets/styles/reset.scss';
import globalCss from './assets/styles/global.scss';


if(process.env.NODE_ENV==='development'){
    const render = (Component)=>{
       ReactDOM.render(
                <AppContainer>
                    <Component/>
                </AppContainer>
       ,document.getElementById("container"))
    };
    render(App);
    if(module.hot){
        module.hot.accept(App,()=>{
            render(App);
        });
    }
  
}else{
    ReactDOM.render(<App/>,document.getElementById("container"));
}
