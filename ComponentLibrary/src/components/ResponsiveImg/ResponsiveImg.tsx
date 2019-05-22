import React from 'react';
import { IResponsiveImgProps,IImgArr } from './ResponsiveImg.types';


class ResponsiveImg extends React.PureComponent<IResponsiveImgProps>{

    constructor(props: IResponsiveImgProps) {
        super(props);
    }
    render() {
        return (
            <>
                <picture>
                    {
                        this.props.imgArr.map((item:IImgArr,index:any)=>{
                            return (
                                <source type={item.imgType} srcSet={item.imgUrl + item.imgQuery} media={item.mediaQuery} key={index} />
                            )
                        })
                    }
                    <img alt={this.props.alt}
                         title={this.props.title}
                         src={this.props.defaultUrl} 
                         className={this.props.cName}/>
                </picture>
            </>
        )
    }
}

export default ResponsiveImg;