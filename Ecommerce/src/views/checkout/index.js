import {connect} from 'react-redux';
import CheckoutComponent from './checkout-component';

const mapStateToProps = state=>{
    return {}
}

const mapDispatchToProps =(dispatch,props)=>{
    return {
        payWithInvoice(){
            props.history.push("/confirmation");
         }
    }
}

let Checkout = connect(mapStateToProps,mapDispatchToProps)(CheckoutComponent);

export default Checkout;