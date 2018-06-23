
import React,{Component} from 'react';
import style from './imgUpload.scss';
// import 'react-image-crop/lib/ReactCrop.scss';
import ReactCrop,{ makeAspectCrop } from 'react-image-crop';


class ImgUpload extends Component{
    //https://devarchy.com/react/library/react-image-crop
    constructor(props){
        super(props);
        this.state = {
            src:"../../assets/images/test.jpg",
            crop: {
                aspect: 16/9
              }
        };
        this.localResource={
            headIcon:{
                height:600,
                width:800
            }
        }
    }

    pictureSelected(e) {
        e.preventDefault();
        let files;
        if (e.dataTransfer) {
            files = e.dataTransfer.files;
        } else if (e.target) {
            files = e.target.files;
        }
        const reader = new FileReader();
        reader.onload = () => {
            let image = new Image();
            image.src = reader.result;
            image.onload = () => {
                let iw = image.width;
                let ih = image.height;
                // let scropW;
                // let scropH;
                // if (iw * this.localResource.headIcon.height > ih * this.localResource.headIcon.width) {
                //     scropH = 100;
                //     scropW = ih * 100 * this.localResource.headIcon.width / this.localResource.headIcon.height / iw;
                // } else {
                //     scropW = 100;
                //     scropH = iw * 100 * this.localResource.headIcon.height / this.localResource.headIcon.width / ih;
                // }
                let initCrop = {
                    aspect: this.localResource.headIcon.width / this.localResource.headIcon.height,
                    height: 0,
                    width: 0,
                    x: 0,
                    y: 0
                };
                this.setState({ crop: initCrop});
            };
            
            this.setState({ src: reader.result, formErrors: [] });
        };
        reader.readAsDataURL(files[0]);
}

    
     
    cropOnClick(crop, pixelCrop) {
        let cropAspect = { aspect: this.localResource.headIcon.width / this.localResource.headIcon.height };
        crop = Object.assign({}, crop, cropAspect);
        this.setState({ crop: crop });
    }

    getCroppedImg(imageSrc, percentageCrop, fileName) {
        if (percentageCrop) {
            debugger;
            // let image = new Image(imageSrc.width, imageSrc.height);
            // image.src = imageSrc;
            // let pixelCrop = {
            //     x:percentageCrop.x,
            //     y:percentageCrop.y,
            //     width:image.width,
            //     height:image.height
            // }
            // const canvas = document.createElement('canvas');
            // canvas.width = this.localResource.headIcon.width;
            // canvas.height = this.localResource.headIcon.height;
            // const ctx = canvas.getContext('2d');

            // ctx.drawImage(
            //     image,
            //     pixelCrop.x,
            //     pixelCrop.y,
            //     pixelCrop.width,
            //     pixelCrop.height,
            //     0,
            //     0,
            //     this.localResource.headIcon.width,
            //     this.localResource.headIcon.height
            // );

            let image = new Image(percentageCrop.width,percentageCrop.height);
            image.src = imageSrc;
            const canvas = document.createElement('canvas');
            canvas.width = this.localResource.headIcon.width;
            canvas.height = this.localResource.headIcon.height;
            const ctx = canvas.getContext('2d');

            ctx.drawImage(
                image,
                percentageCrop.x,
                percentageCrop.y,
                percentageCrop.width,
                percentageCrop.height,
                0,
                0,
                this.localResource.headIcon.width,
                this.localResource.headIcon.height
            );


            // As Base64 string
            let base64Image = canvas.toDataURL('image/jpeg');
            // As a blob
            //let testImage = new Promise((resolve, reject) => {
            //    canvas.toBlob(file => { resolve(file);}, 'image/jpeg');
            //});
            this.setState({ cropResult: base64Image, formErrors: [] });
        } else {
            let errors = [];
             this.setState({ formErrors: errors });
        }
    }


    render(){
        
        return (
            <div>
               <input type="file" accept="image/*" onChange={this.pictureSelected.bind(this)} /><br/>
                   {this.state.src && <ReactCrop onChange={(crop, pixelCrop) => { this.cropOnClick(crop, pixelCrop) }} crop={this.state.crop} src={this.state.src} />}
                   {this.state.src && <div className='clopBtn'>
                       <button type="button" className="btn btn-primary padding-right-16" onClick={this.getCroppedImg.bind(this, this.state.src, this.state.crop, '')}>Crop</button>
                   </div>}
                  {this.state.cropResult && <img src={this.state.cropResult} alt="cropped image" />}
            </div>
        );
    }
}

export default ImgUpload;