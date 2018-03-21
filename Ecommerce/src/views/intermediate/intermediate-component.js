import React,{Component} from 'react';
import Search from '../../components/Search/index.js';
import {Link} from 'react-router-dom';
import interStyle from './intermediate.scss';
class Intermediate extends Component{
    constructor(props){
        super(props);
    }
    render(){
        const style = {
            fontSize:"18px",
            textAlign:"center",
            padding:"60px 0 40px 0"
        }
        return (
            <div className={interStyle.outer}>
                <Search/>
                <Link to='/cart'>&lt; Back to shopping cart</Link>
                <p style={style}>Welcome to our check-out,choose below if you are:</p>
                <div className="row">
                    <div className="col-lg-5 interBlock">
                        <b>New customer</b>
                        <p>Check-out now</p>
                        <Link className="btn bg-sea-blue" to="/cart">Continue</Link>
                    </div>
                    <div className="col-lg-5 interBlock offset-2">
                        <b>New customer</b>
                        <p>Log-in with your Veracity or My DNV GL account</p>
                        <Link className="btn bg-sea-blue" to="/cart">Log-In</Link>
                    </div>
                </div>

                <div className="interDes">100% secured payment by invoice</div>
            </div>
            
        )
    }
}

export default Intermediate;