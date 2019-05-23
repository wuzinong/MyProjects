import React from 'react';
import { IVideoProps } from './Video.types';
import './Video.scss';

class Video extends React.Component<IVideoProps,null>{
    constructor(props:IVideoProps){
        super(props);
    } 
    videoClick = (obj:any)=>{
       let video:HTMLVideoElement = obj.target;
    //    if(video.paused){
    //        video.play();
    //    }else{
    //        video.pause()
    //    }
       //console.log(video);
    }
    render(){
        let result = <iframe className="vui-iframe-video" src={this.props.videoUrl} allowFullScreen={true} frameBorder="0"></iframe>;

        if(this.props.useOrigin){
            result = <video 
            src={this.props.videoUrl} 
            poster={this.props.imgUrl?this.props.imgUrl:""} 
            onClick={this.videoClick} 
            preload="meta" 
            controls></video>;
        } 
        return result;
    }
}

export default Video;