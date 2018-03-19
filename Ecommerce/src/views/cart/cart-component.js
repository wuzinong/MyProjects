import React,{Component} from 'react';
import Search from '../../components/Search/index.js';
class Cart extends Component{
    constructor(props){
        super(props);
    }
    render(){
      
        return (
            <div>
                <Search/>
                <h2>Your Shopping Cart</h2>
            </div>
        )
    }
}

export default Cart;