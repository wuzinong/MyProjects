
;(function(window,document){
  var $ = document.querySelector;
  var options = {
      stage:document.querySelector(".stage"),
      lineNumber:4,
      eleList:[],
      classNameList:["glyphicon-asterisk","glyphicon-plus","glyphicon-euro","glyphicon-glass","glyphicon-music",
                     "glyphicon-search","glyphicon-heart"],
      currentEle:null
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

        for(var i=0;i<option.len;i++){
            var ele = document.createElement("span");
            ele.style.width = option.width +"px";
            ele.style.height= option.height+"px";
            ele.className="glyphicon ";
            var index = rd(0,options.classNameList.length-1);
            ele.className +=options.classNameList[index];
            list.push(ele);
            list.push(ele.cloneNode(true));
        }
        var temp = shuffle(list);
        console.log(temp);
        for(var key=0,tempLen=temp.length;key<tempLen;key++){
           options.stage.appendChild(temp[key]);
        }
  }


  function init(){
      var width = parseInt(getComputedStyle(options.stage).width)-parseInt(getComputedStyle(options.stage).paddingLeft)-parseInt(getComputedStyle(options.stage).paddingRight);
      var eleOption = {
          width:(width/4),
          height:(width/4),
          len:8
      };
      eleFactory(eleOption)
  }
  function bindEvent(){
    options.stage.addEventListener("click",function(event){
        var tempClassName = event.target.className;
        if(tempClassName.indexOf("glyphicon")>=0){

            if(tempClassName.indexOf("rotate")<0){
                event.target.classList.add("rotate")
                var timeout = window.setTimeout(function(){
                    event.target.classList.remove("rotate")
                },2000);
            }

            if(options.currentEle!=null){
                if(options.currentEle == event.target){
                    console.log("self click")
                    return;
                }else{
                    if(options.currentEle.className.indexOf(event.target.className)>=0 || event.target.className.indexOf(options.currentEle.className)>=0){
                        console.log("hit hit hit");
                    }
                    options.currentEle = null;
                }
               
            }else{
                options.currentEle = event.target;
            }
        }
    },false)

  }

  init();
  bindEvent();

})(window,document)