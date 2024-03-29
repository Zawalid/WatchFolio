"use strict";

//* ------------------------------ Utilities ------------------------------ *//
import { showMessage, isValidPassword, showPassword } from "./utilities.js";
// Initialize showPassword function
showPassword();

//* ------------------------------ Firebase ------------------------------ *//
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  sendPasswordResetEmail,
  getSignInErrorMessage,
  getSignUpErrorMessage,
} from "./firebaseApp.js";

//* ------------------------------ Change Form on tab click ------------------------------ *//
const container = document.getElementById("container");
const tabs = document.getElementById("tabs");
// signIn HTML
const signInForm = container.innerHTML;
// Sign Up HTML
const signUpForm = `
  <h1 class="mb-9 text-3xl font-bold text-white max-md:text-center">
    Sign Up & Begin Your
    <span class="text-primaryAccent">TV Show</span> Journey: Track and
    Curate with Ease
  </h1>

  <form id="signUp_form">
  <div class="flex gap-5 mb-5">
  <input
      class="w-full rounded-xl border border-nobleDark500 bg-nobleDark600 p-3 text-white placeholder:text-textColor2 focus:outline-none"
      type="text"
      name="first_name"
      placeholder="First Name"
    />
  <input
      class="w-full rounded-xl border border-nobleDark500 bg-nobleDark600 p-3 text-white placeholder:text-textColor2 focus:outline-none"
      type="text"
      name="last_name"
      placeholder="Last Name"
    />
    </div>
    <input
      class="w-full rounded-xl border border-nobleDark500 bg-nobleDark600 p-3 text-white placeholder:text-textColor2 focus:outline-none"
      type="text"
      name="email"
      placeholder="Email"
    />
    <div class="relative">
            <input
              class="password_input peer mt-5 relative z-[20] w-full rounded-xl border border-nobleDark500 bg-nobleDark600 p-3 text-white placeholder:text-textColor2 focus:outline-none"
              type="password"
              name="password"
              placeholder="Password"
            />
            <i
              class="fa-solid fa-eye eye-icon  absolute right-3 top-1/2  z-30 cursor-pointer text-sm text-textColor2"
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

  <div class="my-8 flex items-center justify-center gap-4">
    <span class="h-[1px] w-full flex-1 bg-textColor2"></span>
    <span class="text-textColor2">or continue with</span>
    <span class="h-[1px] w-full flex-1 bg-textColor2"></span>
  </div>
  <button
    class="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-white py-3 font-bold text-black"
    id="google_signup"
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
  if (e.target.id === "signIn") {
    // If signIn tab is not active (current one), change html
    e.target.classList.contains("active") || changeHtml(signInForm);
    document.title = "WatchFolio - Sign In";
    addActiveClass(e.target);
  }
  if (e.target.id === "signUp") {
    e.target.classList.contains("active") || changeHtml(signUpForm);
    document.title = "WatchFolio - Sign Up";
    addActiveClass(e.target);
    // Wait for html to change and satisfy password requirements
    setTimeout(() => {
      isValidPassword();
    }, 1100);
  }
});

//* ------------------------------ signIn/Sign Up ------------------------------ *//
// Sign in/up with Email and Password
document.addEventListener("submit", (e) => {
  e.preventDefault();

  if (e.target.id === "signIn_form") {
    const email = e.target[0].value;
    const password = e.target[1].value;
    if (email === "" || password === "") {
      showMessage("Please enter your email and password.", "error");
      return;
    }
    signInWithEmailAndPassword(auth, email, password)
      .then(() => (window.location.href = "/"))
      .catch((error) =>
        showMessage(getSignInErrorMessage(error.code), "error")
      );
  } else if (e.target.id === "signUp_form") {
    const firstName = e.target[0].value;
    const lastName = e.target[1].value;
    const email = e.target[2].value;
    const password = e.target[3].value;
    if (
      email === "" ||
      password === "" ||
      firstName === "" ||
      lastName === ""
    ) {
      showMessage("Please fill in all the fields.", "error");
      return;
    }
    if (!isValidPassword()) {
      showMessage(
        "Password is too weak. Please choose a stronger password.",
        "error"
      );
    } else {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Update user's display name
          const user = userCredential.user;
          updateProfile(user, {
            displayName: `${firstName} ${lastName}`,
          }).catch((error) =>
            showMessage(getSignUpErrorMessage(error.code), "error")
          );
          // Switch to signIn tab
          tabs.children[0].click();
          // Wait for html to change and add email to input
          setTimeout(() => {
            document.querySelector("input").focus();
            document.querySelector("input").value = user.email;
          }, 1100);
        })
        .catch((error) =>
          showMessage(getSignUpErrorMessage(error.code), "error")
        );
    }
  }
});
// Sign in/up with Google
document.addEventListener("click", (e) => {
  if (e.target.closest(`#google_signup`)) {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(() => (window.location.href = "/"))
      .catch((error) =>
        showMessage(getSignInErrorMessage(error.code), "error")
      );
  }
});

//* ------------------------------ Forgot Password ------------------------------ *//
const forgotPassContainer = document.getElementById(
  "forgot_password_container"
);
// Forgot password HTML (for resetting it later)
const forgotPassHtml = forgotPassContainer.firstElementChild.innerHTML;
// Show forgot password modal
document.addEventListener("click", (e) => {
  if (e.target.id === "forgot_password") {
    // Change back the html to the original one
    forgotPassContainer.firstElementChild.innerHTML = forgotPassHtml;
    forgotPassContainer.classList.add("show");
    forgotPassContainer.querySelector("input").focus();
  }
});
// Close forgot password modal
forgotPassContainer.addEventListener("click", function (e) {
  if (e.target.closest("#close") || e.target === e.currentTarget) {
    this.classList.remove("show");
  }
});
// Send password reset email (im using the document event listener because the form is dynamically added)
document.addEventListener("submit", (e) => {
  e.preventDefault();
  if (e.target.id == "forgot_password_form") {
    const email = e.target.children[1].value;
    if (email === "") {
      showMessage("Please enter your email address.", "error");
    } else {
      sendPasswordResetEmail(auth, email)
        .then(() => {
          // Change html to show loading animation
          forgotPassContainer.firstElementChild.innerHTML = `
          <i
          class="fa-solid fa-paper-plane mx-auto animate-fadeIn text-4xl text-thirdAccent"
        ></i>
          `;
          setTimeout(() => {
            // Change html to show success message
            forgotPassContainer.firstElementChild.innerHTML = `
          <div class="mt-auto text-center">
          <i
            class="fa-solid fa-envelope-circle-check text-[60px] text-textColor max-sm:text-[100px]"
          ></i>
          <h1 class="mt-5 text-3xl font-bold text-white max-sm:mt-8">
            Check Your Inbox
          </h1>
          <p class="mb-8 mt-5 font-semibold text-textColor2">
            We've sent you an email with instructions on how to reset your
            password.
          </p>
          <div class="flex flex-col items-center gap-5">
            <a
              href="mailto:${email}"
              target="_blank"
              class="w-32 cursor-pointer rounded-2xl bg-secondaryAccent py-2 text-center font-bold text-textColor transition hover:bg-thirdAccent"
            >
              Open Inbox
            </a>
            <button
              class="cursor-pointer font-bold text-textColor transition hover:text-textColor2"
              id="close"
            >
              Skip, I'll check later
            </button>
          </div>
        </div>
        <p
          class="mt-12 text-center font-semibold text-textColor2 max-sm:mt-auto"
        >
          Didn't receive the email? Check your spam folder or
          <span
            class="cursor-pointer font-bold text-primaryAccent"
            id="try_again"
            >try again</span
          >
        </p>
        `;
          }, 1500);
        })
        .catch((error) =>
          showMessage(getSignInErrorMessage(error.code), "error")
        );
    }
  }
});
// Try again
document.addEventListener("click", (e) => {
  if (e.target.id === "try_again") {
    // Change back the html to the original one
    forgotPassContainer.firstElementChild.innerHTML = forgotPassHtml;
  }
});
