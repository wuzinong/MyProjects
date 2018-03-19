import React,{Component} from 'react';
import Search from '../../components/Search';
import detailStyle from './details.scss'; 
class Details extends Component{
    constructor(props){
        super(props);
    }
    addToCart(){
        console.log("add to cart clicked")
    }
    render(){
        const {
            handleClick
        } = this.props;
        return (
            <div>
                <Search/>
                <div className={detailStyle.banner}>
                  <div className="row">
                     <span className="col-lg-10 col-sm-12">Power IQ</span>
                     <span className="col-lg-2 col-sm-12">share:</span>
                  </div>
                  <img src={require('../../assets/images/banner.jpg')} alt="prodct des"/>
                  <div className={detailStyle.videoDes}>
                     <p>Proprietary electric power data and intelligence that deliver market advantage.</p>
                     <button className="hidden-xs btn btn-subtle btn-lg">Watch the video</button>
                  </div>
                </div>

                <div className={"row "+detailStyle.priceArea}>
                    <div className="col-lg-3 col-sm-12">
                        <img src={require("../../assets/images/chart_icon.png")} alt=""/>
                        <p>Optimize assets, manage trading positions & capitalize the global process.</p>
                    </div>
                    <div className="col-lg-3 col-sm-12">
                        <img src={require("../../assets/images/relation_icon.png")} alt=""/>
                        <p>Understand the volatility of the supply stack & analyze the possible outcomes.</p>
                    </div>
                    <div className="col-lg-3 col-sm-12">
                        <img src={require("../../assets/images/note_icon.png")} alt=""/>
                        <p>Get customized service, as team of analysts are available to run tailored scenarios.</p>
                    </div>
                    <div className="col-lg-3 col-sm-12">
                       <select className="form-control variant-select space-stack-sm">
                            <option value="5users">1-5 Users: €100.00 / month</option>
                            <option value="10users">6-10 Users: €100.00 / month</option>
                        </select>
                        <p>VAT not included</p>
                        <button onClick={handleClick} className="btn btn-primary btn-lg space-stack-sm">Add to Cart</button>
                        <button className="btn btn-secondary btn-lg">Request information</button>
                    </div>
                </div>

                <div className={detailStyle.contentList}>
                    
                    {
                        [1,2,3].map((item,index)=>{
                            if(index%2===0){
                            return (
                                <div className={"row "+detailStyle.row}>
                                    <div className="col-lg-6 col-sm-12">
                                        <div>
                                            <h3>Reduce operational risk</h3>
                                            <p>Investigation of incidents and near misses is a key part of most company safety management systems and is a regulatory requirement for major hazard facilities. Good investigation goes beyond immediate and basic technical causes to examine incident management systems root causes and safety barrier failures.</p>
                                            <p>Our Barrier-based Systematic Cause Analysis Technique (BSCAT) combines traditional technical and management system root cause analysis.</p>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-sm-12">
                                        <img src={require("../../assets/images/content.jpg")} alt=""/>
                                    </div>
                                </div>
                            )
                            }else{
                            return (
                                <div className={"row "+detailStyle.row}>
                                    <div className="col-lg-6 col-sm-12">
                                        <img src={require("../../assets/images/content.jpg")} alt=""/>
                                    </div>
                                    <div className="col-lg-6 col-sm-12">
                                        <div>
                                            <h3>Reduce operational risk</h3>
                                            <p>Investigation of incidents and near misses is a key part of most company safety management systems and is a regulatory requirement for major hazard facilities. Good investigation goes beyond immediate and basic technical causes to examine incident management systems root causes and safety barrier failures.</p>
                                            <p>Our Barrier-based Systematic Cause Analysis Technique (BSCAT) combines traditional technical and management system root cause analysis.</p>
                                        </div>
                                    </div>                         
                                </div>
                            )
                            }
                        })
                    }
                     
                </div>
            </div>
        )
    }
}
export default Details;