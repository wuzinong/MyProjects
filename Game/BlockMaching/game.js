
;(function(window,document){
  var $ = document.querySelector;
  var options = {
      stage:document.querySelector(".stage"),
      lineNumber:4,
      eleList:[],
      classNameList:["glyphicon-asterisk","glyphicon-plus","glyphicon-euro","glyphicon-glass","glyphicon-music",
                     "glyphicon-search","glyphicon-heart","glyphicon-star","glyphicon-star-empty","glyphicon-film",
                     "glyphicon-th-large","glyphicon glyphicon-th-list","glyphicon-ok","glyphicon-zoom-in","glyphicon-off",
                     "glyphicon-cog","glyphicon-trash","glyphicon-home","glyphicon-time","glyphicon-road","glyphicon-download",
                     "glyphicon-thumbs-up","glyphicon-phone","glyphicon-flash","glyphicon-cutlery"],
      currentEle:null,
      count:document.querySelector("#count"),
      cleanList:[],
      animationList:["mySkew","myScale","myRotate","myMove"],
      timeArea:document.querySelector("#timeArea")
  }

  function shuffle(array) {
    var currentIndex = array.length
      , temporaryValue
      , randomIndex
      ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  function rd(n,m){
    var c = m-n+1; 
    return Math.floor(Math.random() * c + n);
  }

  function eleFactory(option){
    var list = [];
    var fragment = document.createDocumentFragment();
        for(var i=0;i<option.count;i++){
            var div = document.createElement("div");
            div.style.width = option.width +"px";
            div.style.height= option.height+"px";
            div.className = "card";

            var front = document.createElement("span");
            front.className="frontStyle glyphicon ";
            var index = rd(0,options.classNameList.length-1);
            front.className +=options.classNameList[index];

            var back = document.createElement("span");
            back.className = "backStyle";

            div.appendChild(front);
            div.appendChild(back);

            list.push(div);
            list.push(div.cloneNode(true));
        }
        var temp = shuffle(list);
        for(var key=0,tempLen=temp.length;key<tempLen;key++){
           options.stage.appendChild(temp[key]);
        }
  }


  function init(option){
      var width = parseInt(getComputedStyle(options.stage).width)-parseInt(getComputedStyle(options.stage).paddingLeft)-parseInt(getComputedStyle(options.stage).paddingRight);
      var eleOption = {
          width:(width/option.lineNumber),
          height:(width/option.lineNumber),
          count:option.pairs
      };
      eleFactory(eleOption);
  }

  function addCount(){
    options.count.innerText = parseInt(options.count.innerText)+1;
  }

  function bindEvent(){

    if("ontouchend" in document ){
        options.stage.addEventListener("touchend",function(event){
            var tempClassName = event.target.className;
            if(tempClassName.indexOf("backStyle")>=0){
                var timeout = null;
                //Add animation
                if(tempClassName.indexOf("backRotate")<0){
                    event.target.classList.add("backRotate");
                    event.target.previousElementSibling.classList.add("frontRotate");
                    function clean(){
                        return function(){
                            event.target.classList.remove("backRotate");
                            event.target.previousElementSibling.classList.remove("frontRotate");
                        }
                    }
                    options.cleanList.push(clean());
                    addCount();
                }
    
                if(options.currentEle!=null){
                    if(options.currentEle == event.target){
                        return;
                    }else{
                        if(options.currentEle.previousElementSibling.className.indexOf(event.target.previousElementSibling.className)>=0 || event.target.previousElementSibling.className.indexOf(options.currentEle.previousElementSibling.className)>=0){
                            options.currentEle.previousElementSibling.classList.add("succeed");
                            event.target.previousElementSibling.classList.add("succeed");
                            var tempOptCurr = options.currentEle;
                            var index = rd(0,options.animationList.length-1);
                            var cName =options.animationList[index];
                            var aniTimeout = setTimeout(function(){
                                tempOptCurr.parentElement.classList.add(cName);
                                event.target.parentElement.classList.add(cName);
                                clearTimeout(aniTimeout);
                            },1000)
                            ifPassed();
                        }else{
                            var tempList = options.cleanList;
                            var cleanTimeout =setTimeout(function(){
                                tempList.forEach(function(item){
                                    item();
                                }); 
                                clearTimeout(cleanTimeout);
                            },2000);     
                        }
                        options.cleanList = [];
                        options.currentEle = null;
                    }
                   
                }else{
                    options.currentEle = event.target;
                }
            }
        },false);
    }else{
        options.stage.addEventListener("click",function(event){
            var tempClassName = event.target.className;
            if(tempClassName.indexOf("backStyle")>=0){
                var timeout = null;
                //Add animation
                if(tempClassName.indexOf("backRotate")<0){
                    event.target.classList.add("backRotate");
                    event.target.previousElementSibling.classList.add("frontRotate");
                    function clean(){
                        return function(){
                            event.target.classList.remove("backRotate");
                            event.target.previousElementSibling.classList.remove("frontRotate");
                        }
                    }
                    options.cleanList.push(clean());
                    addCount();
                }
    
                if(options.currentEle!=null){
                    if(options.currentEle == event.target){
                        console.log("self click");
                        return;
                    }else{
                        if(options.currentEle.previousElementSibling.className.indexOf(event.target.previousElementSibling.className)>=0 || event.target.previousElementSibling.className.indexOf(options.currentEle.previousElementSibling.className)>=0){
                            options.currentEle.previousElementSibling.classList.add("succeed");
                            event.target.previousElementSibling.classList.add("succeed");
                            var tempOptCurr = options.currentEle;
                            var index = rd(0,options.animationList.length-1);
                            var cName =options.animationList[index];

                            var aniTimeout = setTimeout(function(){
                                tempOptCurr.parentElement.classList.add(cName);
                                event.target.parentElement.classList.add(cName);
                                clearTimeout(aniTimeout);
                            },1000)
                            ifPassed();
                        }else{
                            var tempList = options.cleanList;
                            var cleanTimeout =setTimeout(function(){
                                tempList.forEach(function(item){
                                    item();
                                }); 
                                clearTimeout(cleanTimeout);
                            },2000);     
                        }
                        options.cleanList = [];
                        options.currentEle = null;
                    }
                   
                }else{
                    options.currentEle = event.target;
                }
            }
        },false);
    }
    

  }

  function preLook(second){
    setTimeout(function(){
        document.querySelectorAll(".frontStyle").forEach(function(item){
           item.classList.add("initRotateFront");
        });
        document.querySelectorAll(".backStyle").forEach(function(item){
          item.classList.add("initRotateBack");
       });
    },second*1000);
    options.timeArea.innerText=second;
    var myInterval = setInterval(function(){
        var seconds =parseInt(options.timeArea.innerText);
        if(seconds === 0){
            options.timeArea.innerText = "";
            clearInterval(myInterval);
        }else{
            options.timeArea.innerText = parseInt(options.timeArea.innerText)-1;
        }
    },1000);
  }
  
  function cleanAll(){ 
    options.stage.innerHTML = "";
    options.count.innerText = 0;
  }

  function endingAnimation(){
      var cardList = document.querySelectorAll(".card");
      cardList.forEach(function(item){
         item.classList.add("endGame");
      })
  }

  function ifPassed(){
      var eles = document.querySelectorAll(".succeed");
      if(eles.length === (initOption.pairs*2)){
         endingAnimation();
          
         var timeout = setTimeout(function(){
            var goNext = window.confirm("是否进入下一关？");
            if(goNext){
               initOption = {
                   lineNumber:initOption.lineNumber*2,
                   pairs:initOption.pairs*4
               }
               cleanAll();
               init(initOption);
               preLook(initOption.pairs);
            }else{
                options.stage.innerText = "what a shame , then you may leave this page";
            }
            clearTimeout(timeout);
         },2000)
      }
  }
  
  var initOption = {
    lineNumber:4,
    pairs:8
  }
  init(initOption);
  preLook(3);
  bindEvent();

})(window,document);