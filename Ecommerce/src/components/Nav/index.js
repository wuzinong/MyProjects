import React,{Component} from 'react';
import navStyle from './nav.scss';
import {Link} from 'react-router-dom';

class Nav extends Component {
    constructor(props){
        super(props);
    }
    render(){
        return (
            <div className = {navStyle.outer}>
                <span>Checkout</span>
                <span className={navStyle.arrow}>&gt;</span>
                <span className={navStyle.disable}>Confirmation</span>
            </div>
        )
    }
}

export default Nav;