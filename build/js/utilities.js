import {
  auth,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  updateEmail,
  updatePassword,
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
  reauthenticateWithCredential,
  EmailAuthProvider,
  getSignInErrorMessage,
} from "./firebaseApp.js";

//* ----------------- Miscellaneous -----------------
//* Show password when eye icon is clicked
const showPassword = () => {
  document.querySelectorAll(".password_input").forEach((input) => {
    const button = input.nextElementSibling;
    document.addEventListener("click", (e) => {
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
const showMessage = (message, type) => {
  const messageEl = document.getElementById("message");
  type === "error"
    ? messageEl.classList.replace("bg-thirdAccent", "bg-red-700")
    : messageEl.classList.replace("bg-red-700", "bg-thirdAccent");

  messageEl.textContent = message;
  messageEl.classList.replace("-top-1/2", "top-5");
  setTimeout(() => {
    messageEl.classList.replace("top-5", "-top-1/2");
  }, 4000);
};

//* ----------------- WatchList, FavoriteList -----------------
//* Toggle watchList, favoriteList
const toggleList = (
  togglerId,
  container,
  listName,
  actions,
  displayFunction
) => {
  document.querySelectorAll(`#${togglerId}`).forEach((toggler) => {
    toggler.addEventListener("click", function () {
      displayFunction(listName);
      container.classList.toggle("show");
      // Check if the user is on the show page and add the overflow-hidden class to the body to prevent scrolling when the watchList is open
      !container.classList.contains("show") &&
      window.location.pathname.includes("show.html")
        ? document.body.classList.remove("h-screen", "overflow-hidden")
        : document.body.classList.remove("overflow-hidden");
      // Switch the actions to the navbar if the favoriteList is open and the media query matches and  Add the active class to the toggler
      if (window.matchMedia("(max-width: 768px)").matches) {
        document.getElementById("nav").appendChild(actions);
        actions.classList.toggle("hidden");
        this.classList.add("active");
      } else {
        container.appendChild(actions);
        actions.classList.remove("hidden");
        this.firstElementChild.classList.add("active");
      }
      // Scroll to the top of the page when the favoriteList is open on mobile
      if (window.matchMedia("(max-width: 768px)").matches) {
        window.scrollTo(0, 0);
        container.classList.contains("show") &&
          document.body.classList.add("h-screen", "overflow-hidden");
      }
    });
  });
};
//* Close the watchList, favoriteList
const closeList = (togglerId, container, actions) => {
  document.addEventListener("click", (e) => {
    if (
      !container.contains(e.target) &&
      !e.target.closest(`#${togglerId}`) &&
      !e.target.closest("#downloadList") &&
      !actions.contains(e.target)
    ) {
      container.classList.remove("show");
      actions.classList.add("hidden");
      // Remove the active class from the toggler
      document.querySelectorAll(`#${togglerId}`).forEach((toggler) => {
        window.matchMedia("(max-width: 768px)").matches
          ? toggler.classList.remove("active")
          : toggler.firstElementChild.classList.remove("active");
      });
    }
  });
};
//* Get the show from the api
//* Display the show in the watchList, favoriteList
const displayShow = async (id, container) => {
  const res = await fetch(`https://api.tvmaze.com/shows/${id}`);
  const show = await res.json();

  return `
  <div class="flex items-center justify-between" >
<a href="show.html?id=${show.id}" class="flex items-center gap-3 " data-id="${
    show.id
  }" >
<img src="${
    show.image?.medium || "./imgs/placeholder.png"
  }" alt="" class="w-[100px] rounded-lg" >
<h3 class="text-textColor font-bold text-lg">${show.name} </h3>
</a>
<i class="fa-solid fa-trash text-textColor2 transition-colors hover:text-secondaryAccent duration-300 text-lg cursor-pointer" id="${
    container.id === "favoritesList"
      ? "removeFromFavoriteList"
      : "removeFromWatchList"
  }"></i>
</div>
`;
};
//* Show the elements from the selected list and change the active button
const displayList = (buttons, container, dataAttr, displayFunction) => {
  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove the active class from all the buttons
      buttons.forEach((button) => button.classList.remove("active"));
      // Add the active class to the clicked button
      this.classList.add("active");
      // Update the current list in the dataset to use to know which list is the current one
      container.dataset[`current_${dataAttr}`] = this.dataset[dataAttr];
      // Display the current list
      displayFunction(this.dataset[dataAttr]);
    });
  });
};
//* Remove from the chosen list when clicking on the trash icon
const removeFromList = (
  buttonId,
  container,
  dataAttr,
  listObject,
  displayFunction,
  removeFunction
) => {
  document.addEventListener("click", (e) => {
    if (e.target.closest(`#${buttonId}`)) {
      // Get the id of the show to remove by getting the href of the show link
      const id = e.target.closest(`#${buttonId}`).previousElementSibling.dataset
        .id;
      // Get the current list from the dataset
      const list = container.dataset[`current_${dataAttr}`];
      console.log(id);
      console.log(
        document.querySelectorAll(`#overview button[data-${dataAttr}]`)
      );
      // Check if the user is on the show page of the show they want to remove and change the button text to the default one
      window.location.href.includes(`show.html?id=${id}`) &&
        document
          .querySelectorAll(`#overview button[data-${dataAttr}]`)
          .forEach((button) => {
            if (button.dataset[dataAttr] == list) {
              button.innerHTML = listObject[list].defaultButton;
            }
          });
      // Remove the show from the list
      removeFunction(id, listObject[list]);
      // Display the shows from the list
      displayFunction(list);
    }
  });
};

//* ----------------- User  -----------------
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
        sendEmailVerification(user).then(() => {
          showMessage(
            "A verification email has been sent to your email address. Please check your inbox and click the verification link to verify your email.",
            "info"
          );
        });
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

//* Handle user account
const handleAccount = () => {
  const account = document.getElementById("account");
  const verifyUserContainer = document.getElementById("verify_user_container");

  //* Show account
  document.getElementById("account_toggler").addEventListener("click", () => {
    if (auth.currentUser) {
      window.scrollTo(0, 0);
      document.body.classList.add("h-screen", "overflow-hidden");
      account.classList.add("show");
    } else {
      window.location.href = "/authentication.html";
    }
  });
  //* CLose the account
  account.addEventListener("click", (e) => {
    if (e.target.closest("#close_account")) {
      window.location.href.includes("show.html")
        ? document.body.classList.remove("h-screen", "overflow-hidden")
        : document.body.classList.remove("overflow-hidden");
      account.classList.remove("show");
    }
  });
  //* cLose the verification container
  verifyUserContainer.addEventListener("click", function (e) {
    if (e.target.closest("#close")) {
      accountDetailsAction.value === "save" && switchToEdit();
      this.classList.remove("show");
    }
  });
  //* Reauthenticate the user
  const reauthenticate = async (func) => {
    verifyUserContainer
      .querySelector("form")
      .addEventListener("submit", function (e) {
        e.preventDefault();
        if (this.email.value === "") {
          showMessage("Please enter your email", "error");
          return;
        }
        if (this.password.value === "") {
          showMessage("Please enter your password", "error");
          return;
        }
        // Get the user's credential (email and password)
        const credential = EmailAuthProvider.credential(
          this.email.value,
          this.password.value
        );
        // Reauthenticate the user
        reauthenticateWithCredential(auth.currentUser, credential)
          .then((res) => {
            verifyUserContainer.classList.remove("show");
            this.reset();
            func();
          })
          .catch((error) =>
            showMessage(getSignInErrorMessage(error.code), "error")
          );
      });
  };
  //* show password when eye icon is clicked
  showPassword();
  //* ----------------- Account Details -----------------
  const accountDetailsForm = document.getElementById("accountDetails_form");
  const accountDetailsAction = accountDetailsForm.action;
  const changePicture = account.querySelector("#change_picture");
  const imageInput = account.querySelector("[name='Image']");
  const accountDetailsInputs = accountDetailsForm.querySelectorAll("input");
  const editDetailsButton = accountDetailsForm.querySelector("button");
  const profilePicture = account.querySelector("#edit");
  const cancelChanges = account.querySelector("#cancel");

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

  //* Switch between edit and save
  const switchToEdit = () => {
    // change the action to edit
    accountDetailsAction.value = "edit";
    // change the button text to Edit
    editDetailsButton.textContent = "Edit";
    // Make the inputs readonly
    accountDetailsInputs.forEach((input) => {
      input.setAttribute("readonly", "readonly");
    });
    // Hide the change picture button
    changePicture.classList.replace("grid", "hidden");
    // Hide the cancel button
    cancelChanges.classList.replace("block", "hidden");
    // restore the user info
    displayUserInfo(auth.currentUser);
  };
  const switchToSave = () => {
    // change the action to save
    accountDetailsAction.value = "save";
    // change the button text to Save Changes
    editDetailsButton.textContent = "Save Changes";
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
    if (accountDetailsAction.value === "edit") {
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
    } else if (accountDetailsAction.value === "save") {
      // Get the inputs
      const inputs = [
        ...document.querySelectorAll("#accountDetails_form input"),
      ];
      // Check if the user didn't leave any field empty
      if (inputs.some((input) => input.value == "")) {
        showMessage("Please fill in all the fields", "error");
      } else {
        // show the verification container
        verifyUserContainer.classList.add("show");
        // reauthenticate the user
        reauthenticate(async () => {
          // Upload the profile picture to firebase storage and get the download url
          const photoURL = profilePicture.src.includes("firebasestorage")
            ? profilePicture.src
            : await uploadProfileImage(profilePicture.src);
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
          // Update the user's info
          auth.currentUser
            .reload()
            .then(() => displayUserInfo(auth.currentUser));
          // Show the success message
          showMessage("Your account details have been updated successfully");
        });
      }
    }
  });

  //* Cancel the changes
  cancelChanges.addEventListener("click", () => switchToEdit());

  //* ----------------- Change Password -----------------
  const changePasswordForm = document.getElementById("changePassword_form");
  isValidPassword();
  changePasswordForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (this.password.value === "") {
      showMessage("Please enter your new password", "error");
      return;
    }
    if (this.confirmNewPassword.value === "") {
      showMessage("Please confirm your new password", "error");
      return;
    }
    if (!isValidPassword()) {
      showMessage(
        "Password is too weak. Please choose a stronger password.",
        "error"
      );
      return;
    }
    if (this.password.value !== this.confirmNewPassword.value) {
      showMessage("Passwords don't match", "error");
      return;
    }
    // Show the verification container
    verifyUserContainer.classList.add("show");
    // Reauthenticate the user
    reauthenticate(async () => {
      // Update the user's password
      updatePassword(auth.currentUser, this.password.value)
        .then(() => {
          // Show the success message
          showMessage("Your password has been changed successfully", "info");
          // Clear the inputs
          this.reset();
        })
        .catch((error) => showMessage(error.message, "error"));
    });
  });

  //* ----------------- Reset Password -----------------
  const resetPasswordButton = document.getElementById("reset_password");
  resetPasswordButton.addEventListener("click", () => {
    // Send the password reset email
    sendPasswordResetEmail(auth, auth.currentUser.email)
      .then(() =>
        showMessage(
          "A password reset email has been sent to your email address",
          "info"
        )
      )
      .catch((error) => showMessage(error.message, "error"));
  });

  //* ----------------- Delete Account -----------------
  const deleteAccountButton = document.getElementById("delete_account");
  deleteAccountButton.addEventListener("click", () => {
    // Show the verification container
    verifyUserContainer.classList.add("show");
    // Reauthenticate the user
    reauthenticate(async () => {
      // Delete the user's account
      auth.currentUser
        .delete()
        .then(() => {
          // Show the success message
          showMessage("Your account has been deleted successfully", "info");
          window.location.href = "/";
        })
        .catch((error) => showMessage(error.message, "error"));
    });
  });
};

//* Export
export {
  showPassword,
  isValidPassword,
  showMessage,
  handleUserAuth,
  handleAccount,
  toggleList,
  closeList,
  displayShow,
  displayList,
  removeFromList,
};
