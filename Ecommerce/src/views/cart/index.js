import {connect} from 'react-redux';
import CartComponent from './cart-component';
const mapDispatchToProps = (dispatch,props)=>{
    return {

    }
}
const mapStateToProps = (state)=>{
    return {

    }
}

const Cart = connect(
    mapStateToProps,
    mapDispatchToProps
)(CartComponent);
export default Cart;
