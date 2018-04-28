
(function(window,document){
  var loginBtn = document.querySelector("#loginBtn");

  loginBtn.addEventListener("click",function(){ 
    var form = document.querySelector(".commonForm");

    var obj = myTool.serialize(form);
    console.log(obj);
    fetch("/api/dologin",{
        method:"POST",
        body:JSON.stringify(obj),
        headers:new Headers({
            'Content-type':'application/json'
        })
      })
      .then(response => response.json())
      .then(data=>{
          console.log(data)
          if(data.status === 0){
             document.querySelector(".bg-danger").innerText = data.message;
          }else{
             location.href = "/home";
          }
      })
      .catch(function(err){
          console.log(err);
      });
  })

})(window,document)