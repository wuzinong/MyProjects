import React,{Component} from 'react';
import style from './about.scss';
import {Link} from 'react-router-dom';

class About extends Component{
    constructor(props){
        super(props);
    }
    render(){
        const {
            handleClick
        } = this.props;
        return (
          <div className={style.des}>
             <p>This is about page</p>
             <Link to="/">return to home</Link>
          </div>
        )
    }
}

export default About;