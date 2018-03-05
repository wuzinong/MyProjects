import React,{Component} from 'react';
import {Link,BrowserRouter} from 'react-router-dom';
import homeStyle from'./home.scss';
import '../../assets/images/person.png';
import Loading from '../../components/Loading/index.js';
import {Button} from 'react-bootstrap';

class Home extends Component{
    constructor(props){
        super(props);
        this.state = {
            showDyy:true
        };
    }
    openDialogue(){
        this.setState({
            showDyy:true
        });
    }
    close(){
        console.log("dddd");
        this.setState({showDyy:false});
    }
    render(){ 
        const {
            handleClick
        } = this.props;
        //var dyy = this.state.showDyy? <Dialogue info="test info" close={()=>{this.close()}}/>:null;
        var dyy = this.state.showDyy? <Loading close={()=>{this.close()}}/>:null;
        return ( 
        //   <div className={homeStyle.whole}>
        //     <p>A test frame for react practicing</p>
        //     <h3>Effects</h3>
        //     <a href="javascript:void(0)" className={homeStyle.btn} onClick={()=>{this.openDialogue()}}>Dialogue</a>
        //     <h3>Pages:</h3>
        //     <a href="javascript:void(0)" className={homeStyle.btn} onClick={handleClick}>Go to About</a> 
        //     <Link className={homeStyle.btn} to='/list'>Go to List</Link> 
        //     {dyy} 
        //   </div> 
        
           <div>
                <div>
                    <h1>Welcome to our Marketplace</h1>
                    <p className="space-stack-sm" style={{fontFamily:"Avenir Next"}}>
                        <span>
                        A catalogue of industrial applications, analytics services and data sets that can help you optimize your performance.                </span>
                    </p>
                </div>
                <div className="row">
                    <div className={"col-xs-12 col-lg-6 space-stack-lg "+homeStyle.gutter}>
                        <a href="#">
                            <div className={"row "+homeStyle.list}>
                                <div className={"col-3 nopadding "+homeStyle.listLeft}>
                                    <img src={require('../../assets/images/demo.png')} alt=""/>
                                    <p className={homeStyle.des}>All industries</p>
                                </div>
                                <div className={"col-9 space-square-md "+homeStyle.detail}>
                                    <h3>Apply for service 1(Process 4)</h3>
                                    <p>Mapping with Apply for Service 1 in MyDNVGL</p>
                                </div>
                            </div>
                        </a>
                    </div>
                    <div className={"col-xs-12 col-lg-6 space-stack-lg "+homeStyle.gutter}>
                        <div className={"row "+homeStyle.list}>
                            <div className={"col-3 nopadding "+homeStyle.listLeft}>
                                <img src={require('../../assets/images/demo.png')} alt=""/>
                                <p className={homeStyle.des}>All industries</p>
                            </div>
                        </div>
                    </div>
                    <div className={"col-xs-12 col-lg-6 space-stack-lg "+homeStyle.gutter}>
                    <div className={"row "+homeStyle.list}>
                        <div className={"col-3 nopadding "+homeStyle.listLeft}>
                            <img src={require('../../assets/images/demo.png')} alt=""/>
                            <p className={homeStyle.des}>All industries</p>
                        </div>
                    </div>
                </div>
                </div>
                {dyy} 
           </div>
        )
    }
}
export default Home;