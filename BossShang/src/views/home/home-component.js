import React,{Component} from 'react';
import {Link,BrowserRouter} from 'react-router-dom';
import homeStyle from'./home.scss';
import '../../assets/images/person.png';
import Dialogue from '../../components/Dialogue/index.js'

class Home extends Component{
    constructor(props){
        super(props);
        this.state = {
            showDyy:false
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
        var dyy = this.state.showDyy? <Dialogue info="test info" close={()=>{this.close()}}/>:null;
        return ( 
          <div className={homeStyle.whole}>
            <p>A test frame for react practicing</p>
            <h3>Effects</h3>
            <a href="javascript:void(0)" className={homeStyle.btn} onClick={()=>{this.openDialogue()}}>Dialogue</a>
            <h3>Pages:</h3>
            <a href="javascript:void(0)" className={homeStyle.btn} onClick={handleClick}>Go to About</a> 
            <Link className={homeStyle.btn} to='/list'>Go to List</Link> 
            <Link className={homeStyle.btn} to='/imgUpload'>Go to ImgUpload</Link> 
            <Link className={homeStyle.btn} to='/skeletonLoading'>Skeleton loading</Link>
            {dyy}
          </div> 
        )
    }
}
export default Home;