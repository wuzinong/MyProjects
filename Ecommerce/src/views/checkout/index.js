import {connect} from 'react-redux';
import CheckoutComponent from './checkout-component';

const mapStateToProps = state=>{
    return {}
}

const mapDispatchToProps =(dispatch,props)=>{
    return {}
}

const Checkout = connect(mapStateToProps,mapDispatchToProps)(CheckoutComponent);

export default Checkout;