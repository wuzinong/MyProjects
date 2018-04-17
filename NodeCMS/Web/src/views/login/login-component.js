import React,{Component} from 'react'; 
import loginStyle from './login.scss';

class Login extends Component {
    constructor(props){
        super(props);
    }

    goLogin(){
        let email = this.email.value;
        let password = this.password.value;
        const {Login} = this.props;
        console.log("login")
        Login({
            email:email,
            password:password,
            ifLogin:false
        });
    }

    render(){
       return (
            <div>
                
                <form className={loginStyle.form}>
                    <h4 className="card-title mb-4 mt-1">Sign in</h4>
                    <div className="form-group">
                        <label>Your email</label>
                        <input ref={(value)=>this.email = value}  className="form-control" placeholder="Email" type="email"/>
                    </div>
                    <div className="form-group">
                        <a className="float-right" href="#">Forgot?</a>
                        <label>Your password</label>
                        <input ref={(value)=>this.password = value} className="form-control" placeholder="******" type="password"/>
                    </div>  
                    <div className="form-group"> 
                        <div className="checkbox">
                        <label> <input type="checkbox"/> Save password </label>
                        </div>  
                    </div>  
                    <div className="form-group">
                        <button onClick={()=>{this.goLogin()}} className="btn btn-primary btn-block"> Login  </button>
                    </div>                                                           
                </form>
            </div>
       )
    }
}

export default Login;