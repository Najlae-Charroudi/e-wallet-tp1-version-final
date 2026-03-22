const loginBtn = document.getElementById("Loginbtn");

loginBtn.addEventListener("click",handlestart);
function handlestart(){
    loginBtn.textContent="loading";
    setTimeout(()=>{
        document.location="login.html";
       
    } , 2000);
}
