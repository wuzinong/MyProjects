var myTool = (function(){
    var serialize = function(form){
        var field = null;
        var len = form.elements.length;
        var obj = {};
        for(var i=0,j=len;i<j;i++){
            field = form.elements[i];
            switch(field.type){
                case "password":
                case "text":{
                    obj[field.name] = field.value;
                }
                break; 
            }
        }
        
        return obj;
    }

    return {
        serialize:serialize
    }
})();