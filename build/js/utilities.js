import {
  auth,
  onAuthStateChanged,
  sendEmailVerification,
  signOut,
} from "./firebaseApp.js";

//* Show password when eye icon is clicked
const showPassword = () => {
  document.addEventListener("click", (e) => {
    const button = document.getElementById("show_password");
    let input = document.querySelector("input[name='password']");
    if (e.target.id === "show_password") {
      if (input.type == "password" && input.value != "") {
        input.type = "text";
        button.className =
          "fa-solid fa-eye-slash absolute right-3 top-1/2 cursor-pointer text-sm text-textColor2";
      } else {
        input.type = "password";
        button.className =
          "fa-solid fa-eye absolute right-3 top-1/2 cursor-pointer text-sm text-textColor2";
      }
    }
    if (
      !input?.contains(e.target) &&
      !button?.contains(e.target) &&
      input?.type == "text"
    ) {
      input.type = "password";
      button.className =
        "fa-solid fa-eye absolute right-3 top-1/2 -translate-y-1/2  cursor-pointer text-sm text-textColor2";
    }
  });
};

//* Validate password
const isValidPassword = () => {
  const passwordInput = document.querySelector("[name='password']");
  const charsLongValidation = document.getElementById("chars_long_validation");
  const specialCharsValidation = document.getElementById(
    "special_chars_validation"
  );
  const numbersValidation = document.getElementById("numbers_validation");
  const uppercaseValidation = document.getElementById("uppercase_validation");
  const lowercaseValidation = document.getElementById("lowercase_validation");
  const checked = "fa-solid fa-check-circle text-green-500  mr-3";
  const unchecked = "fa-regular fa-check-circle text-red-300 mr-3";
  passwordInput.addEventListener("input", function () {
    function validatePassword(condition, icon) {
      if (condition) {
        icon.className = checked;
      } else {
        icon.className = unchecked;
      }
    }
    validatePassword(this.value.length >= 8, charsLongValidation);
    validatePassword(this.value.match(/[^a-zA-Z0-9]/g), specialCharsValidation);
    validatePassword(this.value.match(/[0-9]/g), numbersValidation);
    validatePassword(this.value.match(/[A-Z]/g), uppercaseValidation);
    validatePassword(this.value.match(/[a-z]/g), lowercaseValidation);
  });
  if (
    charsLongValidation.className === unchecked ||
    specialCharsValidation.className === unchecked ||
    numbersValidation.className === unchecked ||
    uppercaseValidation.className === unchecked ||
    lowercaseValidation.className === unchecked
  ) {
    return false;
  }
  return true;
};

//* Show error message
const showError = (message) => {
  const error = document.getElementById("error_message");
  error.textContent = message;
  error.classList.replace("-top-1/2", "top-5");
  setTimeout(() => {
    error.classList.replace("top-5", "-top-1/2");
  }, 3000);
};

//* Display user info
const displayUserInfo = async (user) => {
  // Get the fallback avatar if the user doesn't have a profile picture
  const res = await fetch(
    `https://ui-avatars.com/api/?name=${user.displayName}&background=D4D4D4&rounded=true&size=128&bold=true&color=130F40`
  );
  const blob = await res.blob();
  const avatar = URL.createObjectURL(blob);
  // Show the user's info
  document.getElementById("username").innerText = user.displayName;
  document.getElementById("email").innerText = user.email;
  document
    .querySelectorAll(".avatar")
    .forEach((img) => (img.src = user.photoURL || avatar));
};

//* Handle user authentication
const handleUserAuth = () => {
  onAuthStateChanged(auth, (user) => {
    const signButton = document.getElementById("sign");
    // Check if the user is logged in or not
    console.log(user);
    if (user) {
      //  Send verification email if the user is not verified and the user is in the home page
      if (
        (!user.emailVerified && window.location.pathname === "/") ||
        window.location.pathname === "/index.html"
        
      ) {
        const verificationMessage =
          document.getElementById("email_verification");
        verificationMessage.classList.replace("-top-[150px]", "top-5");
        setTimeout(() => {
          verificationMessage.classList.replace("top-5", "-top-[150px]");
        }, 5000);
        sendEmailVerification(user).catch((err) => console.log(err));
      }
      // Display the user's info
      displayUserInfo(user);
      // Store the user's info in the session storage
      const { displayName, email, photoURL, uid } = user;
      sessionStorage.setItem(
        "user",
        JSON.stringify({
          displayName,
          email,
          photoURL,
          uid,
        })
      );
      // Change the text of the button to sign out
      signButton.innerHTML = `
    <i class="fa-solid fa-sign-out text-2xl"></i>
    <span class="font-semibold">Sign Out</span>
    `;
      //  Change the data-sign of the button to out
      signButton.dataset.sign = "out";
    } else {
      // Remove the user's info from the session storage
      sessionStorage.removeItem("user");
      // Change the text of the button to sign in
      signButton.innerHTML = `
   <i class="fa-solid fa-sign-in text-2xl"></i>
   <span class="font-semibold">Sign In</span>
   `;

      //  Change the data-sign of the button to in
      signButton.dataset.sign = "in";
      // Hide the sign out confirmation
      signOutConfirmation.classList.remove("show");
      // Set the info to guest's
      document.getElementById("username").innerText = "Guest";
      document.getElementById("email").innerText = "";
      document
        .querySelectorAll(".avatar")
        .forEach((img) => (img.src = "./imgs/no profile.png"));
    }
  });

  const signOutConfirmation = document.getElementById("signOut_confirmation");
  // Show the sign out confirmation
  document.addEventListener("click", (e) => {
    if (e.target.closest("#sign")) {
      e.target.closest("#sign").dataset.sign === "in"
        ? (window.location.href = "./authentication.html")
        : signOutConfirmation.classList.add("show");
    }
  });
  // Sign out
  signOutConfirmation.addEventListener("click", (e) => {
    if (e.target.id === "yes") {
      // Sign out the user
      signOut(auth);
    } else if (e.target.id === "no") {
      signOutConfirmation.classList.remove("show");
    }
  });
};

//* Export
export { showPassword, isValidPassword, showError, handleUserAuth };
