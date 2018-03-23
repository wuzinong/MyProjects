import React,{Component} from 'react';
import Search from '../../components/Search/index.js';
import Nav from '../../components/Nav/index';
import checkoutStyle from './checkout.scss';
 
class Checkout extends Component {
    constructor(props){
        super(props);
    }
    render(){
        return (
            <div>
               <Search/>
               <Nav/> 
               <div className={"row "+checkoutStyle.form}>
                   <div className="col-sm-8 space-stack-lg">
                        <h1>Contact Information</h1>
                        <b>All fields are mandatory</b>
                        <h2>Address Book</h2>

                        <div className="form-group">
                            <label>First Name</label>
                            <input type="text"  required="required" placeholder="First Name" />
                            <div className="alert alert-dismissible alert-danger"></div>
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input type="text"  required="required" placeholder="Last Name" />
                            <div className="alert alert-dismissible alert-danger"></div>
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="text"  required="required" placeholder="Email Address" />
                            <div className="alert alert-dismissible alert-danger"></div>
                        </div>
                        <div className="form-group">
                            <label>Mobile Phone Number</label>
                            <input type="text"  required="required" placeholder="Mobile Phone Number" />
                            <div className="alert alert-dismissible alert-danger"></div>
                        </div>

                        <h1>Your company information</h1>
                        <div className="form-group">
                            <label>Company Name</label>
                            <input type="text"  required="required" placeholder="Company Name" />
                            <div className="alert alert-dismissible alert-danger"></div>
                        </div>
                        <div className="form-group">
                            <label>Address Line 1</label>
                            <input type="text"  required="required" placeholder="Address Line 1" />
                            <div className="alert alert-dismissible alert-danger"></div>
                        </div>
                        <div className="form-group">
                            <label>Address Line 2 (optional)</label>
                            <input type="text"  required="required" placeholder="Address Line 2 (optional)" />
                            <div className="alert alert-dismissible alert-danger"></div>
                        </div>
                        <div className="form-group">
                            <label>City</label>
                            <input type="text"  required="required" placeholder="City" />
                            <div className="alert alert-dismissible alert-danger"></div>
                        </div>
                        <div className="form-group">
                            <label>Zip/Postal Code</label>
                            <input type="text"  required="required" placeholder="Zip/Postal Code" />
                            <div className="alert alert-dismissible alert-danger"></div>
                        </div>
                        <div className="form-group">
                            <label>Country</label>
                            <select name="" id="">
                                <option value="">Norway</option>
                                <option value="">China</option>
                            </select>
                            <div className="alert alert-dismissible alert-danger"></div>
                        </div>
                        <div className="form-group">
                            <label>State</label>
                            <select name="" id="">
                                <option value="">State/Region</option> 
                            </select>
                            <div className="alert alert-dismissible alert-danger"></div>
                        </div>
                        <div className="form-group">
                            <label>VAT Id/ Tax registration number</label>
                            <input type="text"  required="required" placeholder="VAT ID number" />
                            <div className="alert alert-dismissible alert-danger"></div>
                        </div>
                        <div className="form-group">
                            <div className="checkbox-inline checkbox-styled">
                                <input autoComplete="off" type="checkbox" name="useAsBillAddress" id="CC-checkoutAddressBook-useAsBillAddress"/>
                                <label htmlFor="CC-checkoutAddressBook-useAsBillAddress">
                                    <span> Use this as my billing address</span>
                                </label>
                            </div>
                        </div>
                   </div>
                   <div className="col-sm-4">
                       <div className={checkoutStyle.cartSummary+" "+checkoutStyle.common}>
                            <b>Cart Summary</b>
                            <p>Automation Test <span>€100.00</span></p>
                            <p>Product 3</p>
                            <p>(Invoice payment)</p>
                            <p>Quantity:1</p>
                            <p>€100.00/year</p>
                       </div>
                       <div className={checkoutStyle.orderSummary+" "+checkoutStyle.common}>
                            <b>Cart Summary</b>
                            <p>Automation Test <span>€100.00</span></p>
                            <p>Product 3</p>
                            <p>(Invoice payment)</p>
                            <p>Quantity:1</p>
                            <p>€100.00/year</p>
                       </div>

                        <button onClick={this.props.payWithInvoice} className="btn btn-primary btn-lg space-stack-sm" >
                            <span>Pay with invoice</span>
                        </button>
                        <button className="btn btn-secondary btn-lg space-stack-sm">
                            <span>Cancel</span>
                        </button>
                   </div>
               </div>
            </div>
        )
    }
}
export default Checkout;