"use strict";

//* ------------------------------ Firebase ------------------------------ *//
import firebase from "./firebaseApp.js";
import "/__/firebase/8.10.1/firebase-auth.js";

const auth = firebase.auth();

//* ------------------------------ Change HTML on tab click ------------------------------ *//
const container = document.getElementById("container");
const tabs = document.getElementById("tabs");
// Login HTML
const loginHtml = container.innerHTML;
// Sign Up HTML
const signUpHtml = `
  <h1 class="mb-9 text-3xl font-bold text-white max-md:text-center">
    Sign Up & Begin Your
    <span class="text-primaryAccent">TV Show</span> Journey: Track and
    Curate with Ease
  </h1>

  <form id="signup_form">
    <input
      class="w-full rounded-xl border border-nobleDark500 bg-nobleDark600 p-3 text-white placeholder:text-textColor2 focus:outline-none"
      type="text"
      name="email"
      placeholder="Email"
    />
    <div class="relative">
            <input
              class="peer mt-5 w-full rounded-xl border border-nobleDark500 bg-nobleDark600 p-3 text-white placeholder:text-textColor2 focus:outline-none"
              type="password"
              name="password"
              placeholder="Password"
              autocomplete="true"
            />
            <i
              class="fa-solid fa-eye eye-icon  absolute right-3 top-1/2   cursor-pointer text-sm text-textColor2"
              id="show_password"
            ></i>
            <div class="absolute w-full sm:w-[325px]  rounded-xl shadow-shadow-1 bg-white p-5 -top-[210px] transition-opacity duration-500 opacity-0 -z-10 peer-focus:opacity-100 peer-focus:z-10" id="password_validation">
            <h3 class="font-bold text-grey-700">Password requirements</h3>
            <ul class="mt-3">
              <li class="text-sm mb-2  text-grey-500"><i id="chars_long_validation" class="fa-regular fa-circle-check mr-3 text-red-300"></i>Should be at least 8 characters</li>
              <li class="text-sm mb-2  text-grey-500"><i id="uppercase_validation" class="fa-regular fa-circle-check mr-3 text-red-300"></i>Contain at least one uppercase</li>
              <li class="text-sm mb-2  text-grey-500"><i id="lowercase_validation" class="fa-regular fa-circle-check mr-3 text-red-300"></i>Contain at least one lowercase</li>
              <li class="text-sm mb-2  text-grey-500"><i id="numbers_validation" class="fa-regular fa-circle-check mr-3 text-red-300"></i>Contain at least one digit</li>
              <li class="text-sm  text-grey-500"><i id="special_chars_validation" class="fa-regular fa-circle-check mr-3 text-red-300"></i>Contain at least one special character</li>
            </ul>
          </div>
          </div>
    <input
      type="submit"
      value="Sign Up"
      class="w-full cursor-pointer rounded-2xl bg-primaryAccent py-3 mt-9 text-lg font-bold text-black transition hover:bg-opacity-80"
    />
  </form>

  <div class="my-12 flex items-center justify-center gap-4">
    <span class="h-[1px] w-full flex-1 bg-textColor2"></span>
    <span class="text-textColor2">or continue with</span>
    <span class="h-[1px] w-full flex-1 bg-textColor2"></span>
  </div>
  <button
    class="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-white py-3 font-bold text-black"
  >
    <img src="./imgs/Google Logo.svg" alt="" />
    <span class="font-semibold">Google Account</span>
  </button>
`;
//* Change HTML function
const changeHtml = (html) => {
  // Add spinner loader
  container.innerHTML = `<i
    class="fa-solid fa-spinner absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-4xl text-thirdAccent"
    ></i>`;
  // Remove spinner loader after 1s and add html
  setTimeout(() => {
    container.innerHTML = html;
  }, 1000);
};
//* Add active class to tab
const addActiveClass = (tab) => {
  [...tabs.children].forEach((tab) => {
    tab.classList.remove("active");
  });
  tab.classList.add("active");
};
//* Switch between tabs
tabs.addEventListener("click", (e) => {
  if (e.target.id === "login") {
    // If login tab is not active (current one), change html
    e.target.classList.contains("active") || changeHtml(loginHtml);
    document.title = "WatchFolio - Login";
    addActiveClass(e.target);
  }
  if (e.target.id === "signup") {
    e.target.classList.contains("active") || changeHtml(signUpHtml);
    document.title = "WatchFolio - Sign Up";
    addActiveClass(e.target);
    // Wait for html to change and satisfy password requirements
    setTimeout(() => {
      isValidPassword();
    }, 1100);
  }
});

//* ------------------------------ Password Functions ------------------------------ *//
// Show password when eye icon is clicked
document.addEventListener("click", (e) => {
  const button = document.getElementById("show_password");
  let input = document.querySelector("input[name='password']");
  if (e.target.id === "show_password") {
    if (input.type == "password" && input.value != "") {
      input.type = "text";
      button.className =
        "fa-solid fa-eye-slash absolute right-3 top-1/2   cursor-pointer text-sm text-textColor2";
    } else {
      input.type = "password";
      button.className =
        "fa-solid fa-eye absolute right-3 top-1/2   cursor-pointer text-sm text-textColor2";
    }
  }
  if (
    !input?.contains(e.target) &&
    !button?.contains(e.target) &&
    input?.type == "text"
  ) {
    input.type = "password";
    button.className =
      "fa-solid fa-eye absolute right-3 top-1/2   cursor-pointer text-sm text-textColor2";
  }
});
// Validate password
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
};

//* ------------------------------ Error Handling ------------------------------ *//
// Show error message
const showError = (message) => {
  const error = document.getElementById("error_message");
  error.textContent = message;
  error.classList.replace("-top-[100px]", "top-5");
  setTimeout(() => {
    error.classList.replace("top-5", "-top-[100px]");
  }, 3000);
};
// Get error message based on error code of sign in
function getSignInErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/invalid-email":
      return "Invalid email format. Please enter a valid email address.";
    case "auth/user-not-found":
      return "User not found. Please check your email or sign up to create an account.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support for assistance.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Please sign in or use a different email to create a new account.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection and try again.";
    case "auth/too-many-requests":
      return "Too many sign-in attempts. Please try again later.";
    case "auth/provider-already-linked":
      return "This provider is already linked to another account.";
    case "auth/account-exists-with-different-credential":
      return "You've already signed up with this provider. Please sign in with your original method.";
    default:
      return "An error occurred during sign-in. Please try again later.";
  }
}
// Get error message based on error code of sign up
function getSignUpErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Please sign in or use a different email to create a new account.";
    case "auth/invalid-email":
      return "Invalid email format. Please enter a valid email address.";
    case "auth/weak-password":
      return "Password is too weak. Please choose a stronger password.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection and try again.";
    default:
      return "An error occurred during sign-up. Please try again later.";
  }
}

//* ------------------------------ Login/Sign Up ------------------------------ *//
document.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = e.target[0].value;
  const password = e.target[1].value;

  if (email === "" || password === "") {
    showError("Please fill in all the required fields.");
  } else {
    if (e.target.id === "login_form") {
      auth
        .signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          console.log(user);
          // ...
        })
        .catch((error) => {
          showError(getSignInErrorMessage(error.code));
        });
    } else if (e.target.id === "signup_form") {
      if (!isValidPassword()) {
        showError("Password is too weak. Please choose a stronger password.")
      } else {
        auth
          .createUserWithEmailAndPassword(email, password)
          .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log(user);
            // Switch to login tab
            tabs.children[0].click();
            // Wait for html to change and add email to input
            setTimeout(() => {
              console.log(document.querySelector("input"));
              document.querySelector("input").focus();
              document.querySelector("input").value = user.email;
            }, 1100);
          })
          .catch((error) => {
            showError(getSignUpErrorMessage(error.code));
          });
      }
    }
  }
});
