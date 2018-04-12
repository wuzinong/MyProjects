import React,{Component} from 'react';
import Search from '../../components/Search/index.js';
import cartStyle from './cart.scss';
import {Link} from 'react-router-dom';
class Cart extends Component{
    constructor(props){
        super(props);
    }
    render(){
      
        return (
            <div>
                <Search/>
                <h2>Your Shopping Cart</h2>
                <div className={cartStyle.table}>
                    <div className="row tHeader">
                        <div className="col-lg-5">Item</div>
                        <div className="col-lg-4">Quantity</div>
                        <div className="col-lg-3">Item Total</div>
                    </div>
                    <div className="row tItems">
                        <div className="col-lg-1">
                            <img src={require("../../assets/images/banner.jpg")} alt=""/>
                        </div>
                        <div className="col-lg-4">
                            <b>Automation Test Prod 3</b>
                            <p>Mapping to automation test 3 service in test environment</p>
                            <p>Free/year</p>
                        </div>
                        <div className="col-lg-4">
                            <Link to="/details"><span className="closeBtn">+</span>Remove</Link>
                        </div>
                        <div className="col-lg-3">
                            €0.00
                        </div>
                    </div>
                    
                </div>
                <div className={cartStyle.checkout}>
                    <strong>Sub-Total:€0.00</strong>
                    <p>VAT not included</p>
                    <Link className="btn btn-primary btn-lg" to="/intermediate">Check-out now</Link>
                </div>
            </div>
        )
    }
}

export default Cart;