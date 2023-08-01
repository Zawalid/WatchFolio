import {
  auth,
  onAuthStateChanged,
  sendEmailVerification,
  signOut,
  updateProfile,
  updateEmail,
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
  reauthenticateWithCredential,
  EmailAuthProvider,
  getSignInErrorMessage
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
          "fa-solid fa-eye-slash absolute z-30 right-3 top-1/2 cursor-pointer text-sm text-textColor2";
      } else {
        input.type = "password";
        button.className =
          "fa-solid fa-eye absolute z-30 right-3 top-1/2 cursor-pointer text-sm text-textColor2";
      }
    }
    if (
      !input?.contains(e.target) &&
      !button?.contains(e.target) &&
      input?.type == "text"
    ) {
      input.type = "password";
      button.className =
        "fa-solid fa-eye absolute z-30 right-3 top-1/2 cursor-pointer text-sm text-textColor2";
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
  }, 4000);
};

//* Display user info
const displayUserInfo = async (user) => {
  // Get the fallback avatar if the user doesn't have a profile picture
  const res = await fetch(
    `https://ui-avatars.com/api/?name=${user.displayName}&background=D4D4D4&rounded=true&size=128&bold=true&color=130F40`
  );
  const blob = await res.blob();
  const avatar = URL.createObjectURL(blob);
  // Show the user's info (menu and profile )
  document.getElementById("username").innerText = user.displayName;
  document.getElementById("accountDetails_form").firstName.value =
    user.displayName.split(" ")[0];
  document.getElementById("accountDetails_form").lastName.value =
    user.displayName.split(" ")[1];
  document.getElementById("email").innerText = document.getElementById(
    "accountDetails_form"
  ).email.value = user.email;
  document
    .querySelectorAll(".avatar")
    .forEach((img) => (img.src = user.photoURL || avatar));
};

//* Handle user authentication
const handleUserAuth = () => {
  onAuthStateChanged(auth, (user) => {
    const signButton = document.getElementById("sign");
    // Check if the user is logged in or not
    if (user) {
      //  Send verification email if the user is not verified and the user is in the home page
      if (
        !user.emailVerified &&
        (window.location.pathname === "/" ||
          window.location.pathname === "/index.html")
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
      // Change the text of the button to sign out
      signButton.innerHTML = `
    <i class="fa-solid fa-sign-out text-2xl"></i>
    <span class="font-semibold">Sign Out</span>
    `;
      //  Change the data-sign of the button to out
      signButton.dataset.sign = "out";
    } else {
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
        : signOutConfirmation.classList.replace("-bottom-24", "bottom-0");
    }
  });
  // Sign out
  signOutConfirmation.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      signOutConfirmation.classList.replace("bottom-0", "-bottom-24");
    }
    if (e.target.id === "yes") {
      // Sign out the user
      signOut(auth);
    }
  });
};

//* Handle user settings
const handleSettings = () => {
  //* Settings : Account Details
  const settings = document.getElementById("settings");
  const accountDetails = document.getElementById("Account Details");
  const accountDetailsForm = accountDetails.querySelector("form");
  const settingAction = settings.querySelector("[name='action']");
  const changePicture = settings.querySelector("#change_picture");
  const imageInput = settings.querySelector("[name='Image']");
  const accountDetailsInputs = accountDetails.querySelectorAll("input");
  const accountDetailsButton = accountDetails.querySelector("button");
  const profilePicture = settings.querySelector("#profile_picture");
  const cancelChanges = settings.querySelector("#cancel");
  const verifyUserContainer = document.getElementById("verify_user_container");

  //* Show settings
  const showSettings = (el) => {
    if (auth.currentUser) {
      // Click on the right tab
      el.dispatchEvent(new Event("click"));
      window.scrollTo(0, 0);
      document.body.classList.add("h-screen", "overflow-hidden");
      settings.classList.add("show");
    } else {
      window.location.href = "/authentication.html";
    }
  };
  // Show the settings when the user clicks on the settings li
  document.getElementById("settings_toggler").addEventListener("click", () => {
    showSettings(settings.querySelector("li[data-tab='Settings']"));
  });
  // Show the account details when the user clicks on the account details li
  document
    .getElementById("accountDetails_toggler")
    .addEventListener("click", () => {
      showSettings(settings.querySelector("li[data-tab='Account Details']"));
    });
  //* CLose the settings
  settings.addEventListener("click", (e) => {
    if (e.target.closest("#close_settings")) {
      window.location.href.includes("show.html")
        ? document.body.classList.remove("h-screen", "overflow-hidden")
        : document.body.classList.remove("overflow-hidden");
      settings.classList.remove("show");
    }
  });

  //* Get the uploaded image and Upload it to firebase storage and return the download url
  const getUploadedImage = async (img) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener("load", (event) => {
        resolve(event.target.result);
      });
      reader.readAsDataURL(img);
    });
  };
  function uploadProfileImage(base64ImageData) {
    return new Promise((resolve, reject) => {
      const user = auth.currentUser;
      if (!user || !user.uid) {
        reject(new Error("User not logged in or UID not available."));
        return;
      }
      // Create a storage reference
      const storageRef = ref(getStorage(), `users/${user.uid}/profile.png`);
      // Upload the image
      uploadString(storageRef, base64ImageData, "data_url").then((snapshot) => {
        // Get the download url
        getDownloadURL(snapshot.ref).then((url) => resolve(url));
      });
    });
  }

  //* Settings tabs
  settings.querySelectorAll("#settings li").forEach((li) => {
    li.addEventListener("click", () => {
      document.getElementById(
        document.querySelector("#settings .active").dataset.tab
      ).style.display = "none";

      document.querySelector("#settings .active").classList.remove("active");

      document.getElementById(li.dataset.tab).style.display = "flex";
      li.classList.add("active");
    });
  });

  //* Switch between edit and save
  const switchToEdit = () => {
    // change the action to edit
    settingAction.value = "edit";
    // change the button text to Edit Profile
    accountDetailsButton.textContent = "Edit Profile";
    // Make the inputs readonly
    accountDetailsInputs.forEach((input) => {
      input.setAttribute("readonly", "readonly");
    });
    // Hide the change picture button
    changePicture.classList.replace("grid", "hidden");
    // Hide the cancel button
    cancelChanges.classList.replace("block", "hidden");
  };
  const switchToSave = () => {
    // change the action to save
    settingAction.value = "save";
    // change the button text to Save Changes
    accountDetailsButton.textContent = "Save Changes";
    // Make the inputs editable
    accountDetailsInputs.forEach((input) => {
      input.removeAttribute("readonly");
    });
    // Show the change picture button
    changePicture.classList.replace("hidden", "grid");
    // Show the cancel button
    cancelChanges.classList.replace("hidden", "block");
  };
  accountDetailsForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (settingAction.value === "edit") {
      // switch to save
      switchToSave();
      // Add the change event listener to the image input to change the profile picture when the user chooses a new one
      imageInput.addEventListener("change", () => {
        if (!imageInput.files[0].type.startsWith("image/")) {
          profilePicture.src = "./imgs/no profile.png";
          return;
        }
        // Get the uploaded image and set it as the profile picture
        getUploadedImage(imageInput.files[0]).then((src) => {
          profilePicture.src = src;
        });
      });
    } else if (settingAction.value === "save") {
      // Get the inputs
      const inputs = [
        ...document.querySelectorAll("#accountDetails_form input"),
      ];
      // Check if the user didn't leave any field empty
      if (inputs.some((input) => input.value == "")) {
        showError("Please fill in all the fields");
      } else {
        // show the verification container
        verifyUserContainer.classList.add("show");
        verifyUserContainer
          .querySelector("form")
          .addEventListener("submit", async function (e) {
            e.preventDefault();
            if (this.email.value === "" || this.password.value === "") {
              showError("Please fill in all the fields");
              return;
            }
            // Get the user's credential (email and password)
            const credential = EmailAuthProvider.credential(
              this.email.value,
              this.password.value
            );
            // Upload the profile picture to firebase storage and get the download url
            const photoURL = profilePicture.src.includes("firebasestorage")
              ? profilePicture.src
              : await uploadProfileImage(profilePicture.src);

            // Reauthenticate the user
            reauthenticateWithCredential(auth.currentUser, credential)
              .then((res) => {
                verifyUserContainer.classList.remove("show");
                // Update the user's display name and photoURL
                updateProfile(auth.currentUser, {
                  displayName: `${accountDetailsForm.firstName.value} ${accountDetailsForm.lastName.value}`,
                  // Check if the user uploaded a new profile picture or not
                  photoURL,
                });
                // Update the user's email
                updateEmail(auth.currentUser, accountDetailsForm.email.value);
                // Switch to edit
                switchToEdit();
              })
              .catch((error) => showError(getSignInErrorMessage(error.code)));
          });
      }
    }
  });

  //* Cancel the changes
  cancelChanges.addEventListener("click", () => switchToEdit());

  //* cLose the verification container
  verifyUserContainer.addEventListener("click", function (e) {
    if (e.target.closest("#close")) {
      switchToEdit();
      this.classList.remove("show");
    }
  });
  //* show password when eye icon is clicked
  showPassword();
};
//* Export
export {
  showPassword,
  isValidPassword,
  showError,
  handleUserAuth,
  handleSettings,
};
