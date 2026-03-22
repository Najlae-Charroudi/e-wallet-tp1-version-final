import { finduserbymail } from "../controllers/database.js";

// DOM
const mailInput = document.getElementById("mail");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("submitbtn");

// Event
submitBtn.addEventListener("click", handleSubmit);

function handleSubmit() {
    console.log("clicked");
    let mail = mailInput.value;
    let password = passwordInput.value;

    if (!mail || password === "") {
        alert("Bad credentials.");
    } else {
        submitBtn.textContent = "Checking!!!";

        setTimeout(() => {

            let user = finduserbymail(mail, password);

            if (user) {
               
                sessionStorage.setItem("currentUser", JSON.stringify(user));

                document.location = "dashboard.html";
            } else {
                alert("Bad credentials.");
                submitBtn.textContent = "Se connecter";
            }

        }, 2000);
    }
}