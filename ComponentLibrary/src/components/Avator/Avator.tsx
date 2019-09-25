import React from 'react';
import {IAvatorProps} from './Avator.types';

let style = require('./Avator.scss');


const Avator = (props:IAvatorProps) =>{
    let tempArea = null;
    let degree = 0;
    const areaClassName = "area";
    let pointPosition = {
        startX:0,
        startY:0,
        endX:0,
        endY:0,
        currentX:null,
        currentY:null,
        inArea:false,
        canvasMouseDown:function(e){
            this.originalTarget = e;
            if(e.offsetX){
                this.startX=e.offsetX;
                this.startY=e.offsetY;
            }else{
                var rect = e.target.getBoundingClientRect();
                this.startX=e.targetTouches[0].pageX - rect.left;
                this.startY=e.targetTouches[0].pageY - rect.top;
            }
        },
        canvasMouseUp:function(e){
            if(e.offsetY){
                this.endX=e.offsetX;
                this.endY=e.offsetY;
            }else{
                var rect = e.target.getBoundingClientRect();
                this.endX=e.changedTouches[0].pageX - rect.left;
                this.endY=e.changedTouches[0].pageY - rect.top;
            }
            clearArea();
            renderArea();
            this.inArea = false;
        },
        areaMouseDown:function(e){
            if(e.target.className == areaClassName){
                this.inArea = true;
                this.currentX = e.clientX;
                this.currentY = e.clientY;
            }
        },
        areaMouseMove:function(e){
        
            if(this.inArea){
                let offsetLeft = e.target.offsetLeft;
                let offsetTop = e.target.offsetTop;
                let afterX = e.clientX;
                let afterY = e.clientY;
                
                let gapX = afterX - this.currentX;
                let gapY = afterY - this.currentY;
                let resultX = offsetLeft  + gapX;
                let resultY = offsetTop  + gapY;
               
                if(resultX>=0 && resultY>=0){
                    this.currentX = afterX;
                    this.currentY = afterY;
                    moveArea(resultX,resultY);
                }
            }
        },
        areaMouseUp:function(e){
            this.inArea = false;
        },
    }

    const getContainer = ()=>{
        let container = document.querySelector("#cvs");
        if(container){
            return container;
        }
    }

    const getResultContainer = ()=>{
        let resultContainer = document.querySelector("#result");
        if(resultContainer){
            return resultContainer;
        }
    }

    const clearArea = ()=>{
        tempArea && getContainer().removeChild(tempArea);
    }
    const moveArea = (x,y) =>{
        if(tempArea){
            tempArea.style.left = x + "px";
            tempArea.style.top = y + "px"; 
        }
    }
    const renderArea = () =>{
        let p = pointPosition;
        tempArea = document.createElement("div");
        tempArea.className = areaClassName;
        tempArea.style.width = Math.abs(p.startX - p.endX) + "px";
        tempArea.style.height = Math.abs(p.startY - p.endY) + "px";
        tempArea.style.position  = "absolute";
        tempArea.style.left = Math.min(p.startX,p.endX) + "px";
        tempArea.style.top = Math.min(p.startY,p.endY) + "px";
        tempArea.style.border = "1px dashed gray";
        //todo: 全部使用element.style.cssText设置样式
        tempArea.style.cssText += "background-color:rgba(0,0,0,.2)";

        tempArea.addEventListener("mousedown",pointPosition.areaMouseDown.bind(pointPosition));
        tempArea.addEventListener("mousemove",pointPosition.areaMouseMove.bind(pointPosition));
        tempArea.addEventListener("mouseup",pointPosition.areaMouseUp.bind(pointPosition));
        getContainer().appendChild(tempArea);
    }

    const cropImg = ()=>{
        let canvas = getContainer().querySelector("canvas");
        let cxt = canvas.getContext("2d");

        if(tempArea){
            let temp = tempArea.style;
            let imgData = cxt.getImageData(parseInt(temp.left),parseInt(temp.top),parseInt(temp.width),parseInt(temp.height));
            let tempCanvas = document.createElement("canvas");
            tempCanvas.width = parseInt(temp.width);
            tempCanvas.height = parseInt(temp.height);
            let tempCxt = tempCanvas.getContext("2d");
            tempCxt.putImageData(imgData,0,0);
            getResultContainer().innerHTML = "";
            getResultContainer().appendChild(tempCanvas);

            //转换成图片
            // let strDataURI = (tempCanvas as any).toDataURL();
            // var a = document.createElement("img");
            // a.src = strDataURI;
            // document.querySelector("body").appendChild(a);
        }
        
    }

    // const rotateImg = () =>{
    //     let canvas = getResultContainer().querySelector("canvas");
    //     let cxt = canvas.getContext("2d");
    //     degree += 45;
    //     degree %= 360;
    //     cxt.save();
    //     cxt.clearRect(0, 0, canvas.width, canvas.height);
    //     cxt.translate(canvas.width / 2, canvas.height / 2);
    //     cxt.rotate(degree / 180 * Math.PI);
    //     cxt.translate(-canvas.width / 2, -canvas.height / 2);
    //     cxt.drawImage(img, canvas.width / 2 - img.width / 2, canvas.height / 2 - img.height / 2);
    //     cxt.restore();
    // }

    const uploadImg =()=>{
        var inputObj = document.createElement('input');
        inputObj.addEventListener('change',readFile,false);
        inputObj.type = 'file';
        inputObj.accept = 'image/*';
        inputObj.id = "file";
        inputObj.click();
    }

    const readFile = (obj:any)=>{
        console.log("jinle")
        getContainer().querySelector("canvas") && getContainer().removeChild(getContainer().querySelector("canvas"));
        var file = obj.srcElement.files[0];//获取input输入的图片
        if(!/image\/\w+/.test(file.type)){
            alert("请确保文件为图像类型");
            return false;
        }
        var reader = new FileReader();
        reader.readAsDataURL(file);//转化成base64数据类型
        reader.onload = function(e){
                 drawToCanvas(this.result);
            }
    }

    function drawToCanvas(imgData){
        var cvs = document.createElement("canvas");
           
        //  cvs.style.cssText = "width:100%;height:100%;";
        let wrapper = getContainer();
        wrapper.appendChild(cvs);
        var ctx = (cvs as any).getContext('2d');
        var img = new Image;
                img.src = imgData;
                img.onload = function(){//必须onload之后再画
                    (cvs as any).width=img.width;
                    (cvs as any).height=img.height;
                    ctx.drawImage(img,0,0,img.width,img.height);
                    let strDataURI = (cvs as any).toDataURL();//获取canvas base64数据
                }
        
        cvs.addEventListener("mousedown",pointPosition.canvasMouseDown.bind(pointPosition));
        cvs.addEventListener("mouseup",pointPosition.canvasMouseUp.bind(pointPosition));
 
        cvs.addEventListener("touchstart",pointPosition.canvasMouseDown.bind(pointPosition));
        cvs.addEventListener("touchend",pointPosition.canvasMouseUp.bind(pointPosition));
    }

    return <>
        <div id="cvs" className={style['avator-wrapper']}>
            
        </div>
        <div id="result">

        </div>
        <button onClick={()=>{uploadImg()}}>Upload image</button>
        <button onClick={()=>{cropImg()}}>Crop</button>
        {/* <button onClick={()=>{rotateImg()}}>Rotate</button> */}
    </>
 }
 
 export default Avator;