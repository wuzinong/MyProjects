import React from 'react';
import {IAvatorProps} from './Avator.types';

let style = require('./Avator.scss');


const Avator = (props:IAvatorProps) =>{

    const uploadImg =()=>{
        
        var inputObj = document.createElement('input');
        
        inputObj.addEventListener('change',readFile,false);
        inputObj.type = 'file';
        inputObj.accept = 'image/*';
        inputObj.id = "file";
        inputObj.click();

    }
    const readFile = (obj:any)=>{
        let wrapper = document.querySelector("#cvs");
        document.querySelector("#cvs canvas") && wrapper.removeChild(document.querySelector("#cvs canvas"));
        var file = obj.srcElement.files[0];//获取input输入的图片
        if(!/image\/\w+/.test(file.type)){
            alert("请确保文件为图像类型");
            return false;
        }//判断是否图片，在移动端由于浏览器对调用file类型处理不同，虽然加了accept = 'image/*'，但是还要再次判断
        var reader = new FileReader();
        reader.readAsDataURL(file);//转化成base64数据类型
        reader.onload = function(e){
                 drawToCanvas(this.result);
            }
    }
    
    function drawToCanvas(imgData){
        var cvs = document.createElement("canvas");
            (cvs as any).width=300;
            (cvs as any).height=400;
        let wrapper = document.querySelector("#cvs");
        wrapper.appendChild(cvs);
        var ctx = (cvs as any).getContext('2d');
        var img = new Image;
                img.src = imgData;
                img.onload = function(){//必须onload之后再画
                    ctx.drawImage(img,0,0,300,400);
                    let strDataURI = (cvs as any).toDataURL();//获取canvas base64数据
                }
    }

    return <div id="cvs" className={style['avator-wrapper']}>
                To be done
                <button onClick={()=>{uploadImg()}}>Upload image</button>
        </div>
 }
 
 export default Avator;