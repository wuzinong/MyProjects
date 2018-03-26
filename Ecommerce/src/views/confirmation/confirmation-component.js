import React,{Component} from 'react';
import Search from '../../components/Search'
import confirmationStyle from './confirmation.scss';

class Confirmation extends Component{
    constructor(props){
        super(props);
    }
    render(){ 
        return (
            <div className={confirmationStyle.confirmation}>
               <Search/>
               <div className="confirmationText">
                   <b>Thank your for your purchase</b>
                   <p>Find below your order summary, as well as all the useful information you may need.</p>
                   <p>You will also recieve an email confirmation with your order invoice.</p>
               </div>
               <h2>Your Order Information</h2>
               <div className="row space-stack-md">
                    <div className="col-sm-7 col-xs-12">
                        <div className="order-box order-box-mb space-inset-sm">
                            <ul>
                            <li><strong>Order number:</strong> <span data-bind="text: $data.id">o321982</span></li>
                            <li><strong>Order amount:</strong> <span data-bind="currency: {price: $data.priceInfo.amount, currencyObj: $data.priceListGroup.currency}">€0.00</span></li>
                            <li><strong>VAT:</strong> <span data-bind="currency: {price: $data.priceInfo.tax, currencyObj: $data.priceListGroup.currency}">€0.00</span></li>
                            <li><strong>Order description:</strong> <span data-bind="text: $data.shoppingCart.items[0].displayName">Automation Test Product 3 (InvoicePayment)</span></li>
                            <li><strong>Buyer:</strong> <span data-bind="text: $data.shippingAddress.firstName">Bran</span>&nbsp;<span data-bind="text: $data.shippingAddress.lastName">Gu</span></li>
                            <li><strong>Contact mail:</strong> <span data-bind="text: $data.shippingAddress.email">wuzinong@test.com</span></li>
                            <li><strong>Mobile phone number:</strong> <span data-bind="text: $data.shippingAddress.phoneNumber">+8611111111111</span></li>
                            </ul>
                        </div>
                    </div>

                    <div className="col-sm-5 col-xs-12">
                        <div className="order-box order-box-blue space-inset-sm flex-align">
                            <div className="support-item-container">
                                <a href="mailto:wuzinong@gmail.com" className="order-support-item clearfix contactUsMail">
                                <div className="order-support-image">
                                    <img className="order-icon" src={require("../../assets/images/email.png")} alt=""/>
                                </div>
                                <div className="order-support-text">
                                    <h3>Contact us</h3>
                                    <p>For any concerns that you might have, please contact us.</p>
                                </div>
                                </a>
                                <a href="javascript:void(0)" className="order-support-item clearfix faq">
                                <div className="order-support-image">
                                    <img className="order-icon" src={require("../../assets/images/question.png")} alt=""/>
                                </div>
                                <div className="order-support-text">
                                    <h3>FAQ</h3>
                                    <p>Check our FAQ for useful questions and answers you might have.</p>
                                </div>
                                </a>
                            </div>
                        </div>
                    </div>
               </div>

               <div className="row confirmationInformation space-stack-md">
                    <div className="row col-12 nopadding">
                        <div className="col-sm-6">                
                            <ul>
                                <li><b>Your company information</b></li>
                                <li><strong>Order number:</strong> <span data-bind="text: $data.id">o321982</span></li>
                                <li><strong>Order amount:</strong> <span data-bind="currency: {price: $data.priceInfo.amount, currencyObj: $data.priceListGroup.currency}">€0.00</span></li>
                                <li><strong>VAT:</strong> <span data-bind="currency: {price: $data.priceInfo.tax, currencyObj: $data.priceListGroup.currency}">€0.00</span></li>
                                <li><strong>Order description:</strong> <span data-bind="text: $data.shoppingCart.items[0].displayName">Automation Test Product 3 (InvoicePayment)</span></li>
                                <li><strong>Buyer:</strong> <span data-bind="text: $data.shippingAddress.firstName">Bran</span>&nbsp;<span data-bind="text: $data.shippingAddress.lastName">Gu</span></li>
                                <li><strong>Contact mail:</strong> <span data-bind="text: $data.shippingAddress.email">wuzinong@test.com</span></li>
                                <li><strong>Mobile phone number:</strong> <span data-bind="text: $data.shippingAddress.phoneNumber">+8611111111111</span></li>
                            </ul>
                        </div>
                        <div className="col-sm-6">
                            <ul>
                                <li><b>Your billing information</b></li>
                                <li><strong>Order number:</strong> <span data-bind="text: $data.id">o321982</span></li>
                                <li><strong>Order amount:</strong> <span data-bind="currency: {price: $data.priceInfo.amount, currencyObj: $data.priceListGroup.currency}">€0.00</span></li>
                                <li><strong>VAT:</strong> <span data-bind="currency: {price: $data.priceInfo.tax, currencyObj: $data.priceListGroup.currency}">€0.00</span></li>
                                <li><strong>Order description:</strong> <span data-bind="text: $data.shoppingCart.items[0].displayName">Automation Test Product 3 (InvoicePayment)</span></li>
                                <li><strong>Buyer:</strong> <span data-bind="text: $data.shippingAddress.firstName">Bran</span>&nbsp;<span data-bind="text: $data.shippingAddress.lastName">Gu</span></li>
                                <li><strong>Contact mail:</strong> <span data-bind="text: $data.shippingAddress.email">wuzinong@test.com</span></li>
                                <li><strong>Mobile phone number:</strong> <span data-bind="text: $data.shippingAddress.phoneNumber">+8611111111111</span></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <h2>Your order summary</h2>
            </div>
        )
    }
}
export default Confirmation;