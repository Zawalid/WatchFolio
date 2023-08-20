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
  GoogleAuthProvider,
  getSignInErrorMessage,
  db,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  deleteObject,
  linkWithPopup,
  unlink,
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

//* Handle user connection status
const handleConnection = () => {
  const connectionStatus = document.getElementById("connectionStatus");
  const showAndHideConnectionStatus = () => {
    connectionStatus.classList.replace("-bottom-14", "bottom-3");
    setTimeout(() => {
      connectionStatus.classList.replace("bottom-3", "-bottom-14");
    }, 3000);
  };
  window.addEventListener("online", () => {
    connectionStatus.lastElementChild.innerText = "Back online";
    connectionStatus.classList.replace("text-textColor2", "text-primaryAccent");
    showAndHideConnectionStatus();
  });
  window.addEventListener("offline", () => {
    connectionStatus.lastElementChild.innerText = "No  connection";
    connectionStatus.classList.replace("text-primaryAccent", "text-textColor2");
    showAndHideConnectionStatus();
  });
};
handleConnection();

//* Show the watchList, favoriteList,account when changing the hash
["load", "hashchange"].forEach((event) => {
  window.addEventListener(event, (e) => {
    if (window.location.hash === "#watchlist") {
      // Get the toggler that is not hidden
      const toggler = [...document.querySelectorAll("#watchList_toggler")].find(
        (toggler) => {
          return window.getComputedStyle(toggler).display === "flex";
        }
      );
      // Check if the user is singed in and then wait for the watchList to be retrieved from the database and then open the watchList
      checkIfUserIsLoggedIn()
        .then((user) => {
          return getDoc(doc(db, "watchList", user.uid)).then((doc) => {
            doc.exists() && toggler.dispatchEvent(new Event("click"));
          });
        })
        // If the user is not signed in, open the watchList directly
        .catch(() => {
          toggler.dispatchEvent(new Event("click"));
        });
    } else if (window.location.hash === "#favorites") {
      // Get the toggler that is not hidden
      const toggler = [
        ...document.querySelectorAll("#favoritesList_toggler"),
      ].find((toggler) => {
        return window.getComputedStyle(toggler).display === "flex";
      });
      toggler.dispatchEvent(new Event("click"));
    } else if (window.location.hash === "#account") {
      checkIfUserIsLoggedIn()
        .then(() => {
          document
            .getElementById("account_toggler")
            .dispatchEvent(new Event("click"));
        })
        .catch(() => {
          window.location.href = "./authentication.html";
        });
    }
  });
});

//* ----------------- WatchList, FavoriteList -----------------
//* Toggle watchList, favoriteList
const toggleList = (togglerId, container, actions, displayFunction) => {
  document.querySelectorAll(`#${togglerId}`).forEach((toggler) => {
    toggler.addEventListener("click", function () {
      // Display the elements from the first list
      container.id === "watchList"
        ? displayFunction("watched")
        : displayFunction("shows");
      container.classList.toggle("show");
      // Add the active class to the toggler
      this.classList.add("active");
      // Switch the actions to the navbar if the favoriteList is open and the media query matches and  Add the active class to the toggler
      if (window.matchMedia("(max-width: 768px)").matches) {
        document.getElementById("nav").appendChild(actions);
        actions.classList.toggle("hidden");
      } else {
        container.appendChild(actions);
        actions.classList.remove("hidden");
      }
    });
  });
};
//* Close the watchList, favoriteList
const closeList = (togglerId, container, actions, displayFunction) => {
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
        toggler.classList.remove("active");
      });
      // Display the elements from the first list
      container.id === "watchList"
        ? displayFunction("watched")
        : displayFunction("shows");
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
      // Hide the search input if it's open
      hideSearchInput(document.querySelector("input[name='search'].show"));
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
      // Check if the user is on the show page of the show they want to remove and change the button text to the default one
      window.location.href.includes(`show.html?id=${id}`) &&
        document
          .querySelectorAll(`#overview button[data-${dataAttr}]`)
          .forEach((button) => {
            if (button.dataset[dataAttr] == list) {
              button.innerHTML =
                listObject[list].defaultButton || listObject.defaultButton;
            }
          });
      // Remove the show from the list
      removeFunction(id, listObject[list]);
      // Display the shows from the list
      displayFunction(list);
    }
  });
};
//* Clear the watchList, favoriteList
const clearList = (container, listObject, dataAttr, displayFunction) => {
  //* Clear the watchList
  const clearConfirmation = container.querySelector("#clear_confirmation");
  const clearFunc = () => {
    // SHow confirmation modal
    const listElements = container.id === "watchList" ? "shows" : "list";
    listObject[container.dataset[`current_${dataAttr}`]][listElements].size >
      0 && clearConfirmation.classList.replace("hidden", "flex");
    clearConfirmation.addEventListener("click", (e) => {
      if (e.target.closest("#no")) {
        clearConfirmation.classList.replace("flex", "hidden");
      }
      if (e.target.closest("#yes")) {
        clearConfirmation.classList.replace("flex", "hidden");
        const currentList = container.dataset[`current_${dataAttr}`];

        // Clear the list from the local storage
        window.localStorage.setItem(currentList, "");
        // Clear the list from the listObject object
        listObject[currentList][listElements].clear();
        // Display the shows from the list
        displayFunction(currentList);
        // Check if the user is on the show page and change the button text to the default one
        window.location.pathname.includes("show.html") &&
          document.querySelectorAll("#overview button").forEach((button) => {
            if (button.dataset[dataAttr] == currentList) {
              button.innerHTML =
                listObject[currentList].defaultButton ||
                listObject.defaultButton;
            }
          });
      }
    });
  };
  container
    .querySelector("#actions #clear")
    .addEventListener("click", clearFunc);
};
//* Sort the watchList, favoriteList
const sortList = (container) => {
  const sortFunc = (direction) => {
    const currentELements = [...container.querySelectorAll("[data-id]")];
    const html =
      direction === "AZ"
        ? currentELements.toSorted((a, b) =>
            a
              .querySelector("h3")
              .innerText.localeCompare(b.querySelector("h3").innerText)
          )
        : currentELements
            .toSorted((a, b) =>
              a
                .querySelector("h3")
                .innerText.localeCompare(b.querySelector("h3").innerText)
            )
            .toReversed();
    currentELements.length > 0
      ? (container.querySelector(
          `#${container.id === "watchList" ? "shows" : "favorites"}`
        ).innerHTML = html)
      : "";
  };
  //* Sort from A to Z
  container
    .querySelector("#actions #sortAZ")
    .addEventListener("click", () => sortFunc("AZ"));
  //* Sort from Z to A
  container
    .querySelector("#actions #sortZA")
    .addEventListener("click", () => sortFunc("ZA"));
};
//* Search in the watchList, favoriteList
const searchList = (searchListInput, container, currentELements) => {
  // Get the query and convert it to lowercase
  const query = searchListInput.value.toLowerCase();
  // Filter the shows based on the query
  const results = currentELements.filter((a) => {
    return a.querySelector("h3").textContent.toLowerCase().includes(query);
  });
  // Display the results or a message if there are no results
  container.querySelector(
    `#${container.id === "watchList" ? "shows" : "favorites"}`
  ).innerHTML =
    results.length > 0
      ? results.map((res) => res.parentElement.outerHTML).join("")
      : `<div class="flex-1 flex flex-col items-center justify-center col-span-5 ml-[50%]  -translate-x-1/2 ">
      <img src="./imgs/no_result.png" alt="" class="w-52" />
      <h2 class="text-xl font-bold text-textColor2">No Results Found</h2>
      </div>
      `;
};
const showSearchInput = (container, searchListInput, listObject, dataAttr) => {
  // Toggle the search input
  listObject[container.dataset[`current_${dataAttr}`]][
    container.id === "watchList" ? "shows" : "list"
  ].size > 0 && searchListInput.classList.toggle("show");
  searchListInput.placeholder =
    container.id === "watchList"
      ? "Search for shows"
      : `Search for favorite ${container.dataset[`current_${dataAttr}`]}
  `;
  // Focus or blur out of the input
  searchListInput.classList.contains("show")
    ? searchListInput.focus()
    : searchListInput.blur();
  // Change the icon
  searchListInput.classList.contains("show")
    ? document
        .querySelector("#actions:not(.hidden) #search")
        .classList.replace(
          "fa-magnifying-glass-plus",
          "fa-magnifying-glass-minus"
        )
    : document
        .querySelector("#actions:not(.hidden) #search")
        .classList.replace(
          "fa-magnifying-glass-minus",
          "fa-magnifying-glass-plus"
        );
};
const hideSearchInput = (searchListInput) => {
  // Clear the input
  if (searchListInput) searchListInput.value = "";
  // Hide the input
  searchListInput?.classList.remove("show");
  // Change the icon
  document
    .querySelector("#actions:not(.hidden) #search")
    .classList.replace("fa-magnifying-glass-minus", "fa-magnifying-glass-plus");
};
//* Update localStorage or database based on the user state
const updateLocalStorageOrDatabase = async (document, lists) => {
  // Get the right object (watchList or favoriteList)
  const obj =
    document === "Favorites"
      ? "list"
      : document === "watchList"
      ? "shows"
      : "episodes";
  try {
    const user = await checkIfUserIsLoggedIn();
    lists.forEach((list) => {
      updateDoc(doc(db, document, user.uid), {
        [list.name]: [...list[obj]],
      });
    });
  } catch (err) {
    lists.forEach((list) => {
      window.localStorage.setItem(list.name, [...list[obj]]);
    });
  }
};
//* Retrieve from the local storage or database based on the user state
const retrieveFromLocalStorageOrDatabase = async (document, list) => {
  // Get the right object (watchList or favoriteList)
  const obj =
    document === "Favorites"
      ? "list"
      : document === "watchList"
      ? "shows"
      : "episodes";
  try {
    const user = await checkIfUserIsLoggedIn();

    return getDoc(doc(db, document, user.uid)).then((doc) => {
      if (doc.exists()) {
        list[obj] = new Set(doc.data()[list.name]);
      }
      // So that i use the filled object with the buttons
      return Promise.resolve(list);
    });
  } catch (err) {
    const lists = window.localStorage.getItem(list.name)?.split(",");
    // Remove the empty string from the array (it's added when the list is empty)
    lists && lists[0] == "" && lists.splice(0, 1);
    // Store the shows/seasons/episodes back in the lists
    list[obj] = new Set(lists);

    return Promise.resolve(list);
  }
};
//* Store the lists in the local storage or database if the lists don't exist
const storeInLocalStorageOrDatabase = async (document, lists) => {
  try {
    const user = await checkIfUserIsLoggedIn();
    for (let list of lists) {
      getDoc(doc(db, document, user.uid)).then((snapshot) => {
        // Check if the document exists and if the list doesn't exist in the document, create it
        if (snapshot.exists()) {
          if (!snapshot.data()[list]) {
            updateDoc(doc(db, document, user.uid), {
              [list]: [],
            });
          }
        } else {
          // Create the document and the list
          setDoc(doc(db, document, user.uid), {
            [list]: [],
          });
        }
      });
    }
  } catch (err) {
    lists.forEach((list) => {
      if (!window.localStorage.getItem(list)) {
        window.localStorage.setItem(list, "");
      }
    });
  }
};

//* ----------------- User  -----------------
//* Check if the user is logged in
const checkIfUserIsLoggedIn = () => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user);
      } else {
        reject("User is not logged in");
      }
    });
  });
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

  // Change the profile picture in the menu and the profile
  document
    .querySelectorAll(".avatar")
    .forEach((img) => (img.src = user.photoURL || avatar));
};

//* Handle user authentication
const handleUserAuth = () => {
  const signButton = document.getElementById("sign");
  const signOutConfirmation = document.getElementById("signOut_confirmation");
  onAuthStateChanged(auth, (user) => {
    if (user) {
      //  Send verification email if the user is not verified and the user is in the home page
      if (
        !user.emailVerified &&
        (window.location.pathname === "/" ||
          window.location.pathname === "/index.html")
      ) {
        // Check if the verification email has been sent before
        if (document.cookie.includes("emailSent=true")) {
          return;
        }
        // Send the verification email
        sendEmailVerification(user).then(() => {
          showMessage(
            "A verification email has been sent to your email address. Please check your inbox and click the verification link to verify your email.",
            "info"
          );
          // Set a cookie to prevent the verification email from being sent again
          document.cookie = "emailSent=true; max-age=86400; path=/";
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

      // Clear the local storage if the user is logged in
      window.localStorage.clear();

      // Hide the synchronization info
      document.getElementById("syncInfo").classList.add("hidden");
      document
        .getElementById("syncInfo")
        .nextElementSibling.classList.add("hidden");
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
      // Show the synchronization info
      // Hide the synchronization info
      document.getElementById("syncInfo").classList.remove("hidden");
      document
        .getElementById("syncInfo")
        .nextElementSibling.classList.remove("hidden");
    }
  });
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
      // Redirect the user to the home page
      window.location.href = "/";
    }
  });
};

//* Handle user account
const handleAccount = async () => {
  const account = document.getElementById("account");
  const verifyUserContainer = document.getElementById("verify_user_container");

  //* Show account
  document.getElementById("account_toggler").addEventListener("click", () => {
    if (auth.currentUser) {
      // SHow the email not verified message every time the user opens the account if the user's email is not verified
      const emailNotVerified = document.getElementById("emailNotVerified");
      // Show the email not verified message if the user's email is not verified
      !auth.currentUser.emailVerified &&
        emailNotVerified.classList.replace("hidden", "flex");
      // Send the verification email when the user clicks on the button
      emailNotVerified.querySelector("button").addEventListener("click", () => {
        sendEmailVerification(auth.currentUser).then(() => {
          showMessage(
            "A verification email has been sent to your email address. Please check your inbox and click the verification link to verify your email.",
            "info"
          );
          // Hide the email not verified message
          emailNotVerified.classList.replace("flex", "hidden");
        });
      });
      account.classList.add("show");
    } else {
      window.location.href = "/authentication.html";
    }
  });
  //* CLose the account
  account.addEventListener("click", (e) => {
    if (e.target.closest("#close_account")) {
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
          .then(() => {
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
  const profilePicture = account.querySelector("img");
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
      const storageRef = ref(getStorage(), `usersProfiles/${user.uid}.png`);
      // Upload the image
      uploadString(storageRef, base64ImageData, "data_url").then((snapshot) => {
        // Get the download url
        getDownloadURL(snapshot.ref).then((url) => resolve(url));
      });
    });
  }

  //* Switch between edit and save
  const switchToEdit = (saved = false) => {
    // change the action to edit
    accountDetailsAction.value = "edit";
    // change the button text to Edit
    editDetailsButton.textContent = "Edit Details";
    // Make the inputs readonly
    accountDetailsInputs.forEach((input) => {
      input.setAttribute("readonly", "readonly");
    });
    // Hide the change picture button
    changePicture.classList.replace("grid", "hidden");
    // Hide the cancel button
    cancelChanges.classList.replace("block", "hidden");
    // restore the user info
    !saved && displayUserInfo(auth.currentUser);
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
      imageInput.addEventListener("change", async () => {
        const image = imageInput.files[0];
        if (!image.type.startsWith("image/")) {
          profilePicture.src = "./imgs/no profile.png";
          return;
        } else {
          profilePicture.src = await getUploadedImage(image);
        }
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
        // Set the verification action
        verifyUserContainer.querySelector("#action").textContent =
          "updating your information";
        // show the verification container
        verifyUserContainer.classList.add("show");
        // reauthenticate the user
        reauthenticate(async () => {
          // Upload the profile picture to firebase storage and get the download url
          const photoURL = profilePicture.src.includes("http")
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
          // Switch to edit with the saved to not restore the user's info
          switchToEdit(true);
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
    // Set the verification action
    verifyUserContainer.querySelector("#action").textContent =
      "changing your password";
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
      .catch((error) => {
        let message;
        switch (error.code) {
          case "auth/network-request-failed":
            message = "Please check your internet connection and try again";
            break;
          case "auth/too-many-requests":
            message = "Too many requests. Please try again later";
            break;
          default:
            message = "Something went wrong. Please try again later";
        }
        showMessage(message, "error");
      });
  });

  //* -----------------  Account Linking -----------------
  const accountLinking = document.getElementById("account_linking");
  const switchToLink = () => {
    accountLinking.querySelector("p").textContent =
      "Link your account to your Google account to be able to login with your Google account. You can unlink your account at any time.";
    accountLinking.querySelector("button").textContent = "Link Account";
  };
  const switchToUnlink = () => {
    accountLinking.querySelector("p").textContent =
      "Unlinking your account from your Google account will prevent you from logging in with your Google account. You can link your account again at any time.";
    accountLinking.querySelector("button").textContent = "Unlink Account";
  };
  // Check if the user has already google linked with their account and change the ui based on that
  try {
    const user = await checkIfUserIsLoggedIn();
    user.providerData.length > 1 ? switchToUnlink() : switchToLink();
    // Hide the account linking functionality if the user is signed in with only google account
    user.providerData.length === 1 &&
    user.providerData[0].providerId === "google.com"
      ? (accountLinking.classList.add("hidden"),
        accountLinking.nextElementSibling.classList.add(
          "border-y",
          "border-nobleDark500"
        ))
      : (accountLinking.classList.remove("hidden"),
        accountLinking.nextElementSibling.classList.remove(
          "border-y",
          "border-nobleDark500"
        ));
  } catch (err) {}
  // Link or unlink the user account
  accountLinking.querySelector("button").addEventListener("click", () => {
    if (auth.currentUser.providerData.length > 1) {
      switchToUnlink();
      unlink(auth.currentUser, "google.com").then(() => {
        showMessage("Your account has been unlinked successfully", "info");
        switchToLink();
      });
    } else {
      switchToLink();
      linkWithPopup(auth.currentUser, new GoogleAuthProvider())
        .then(() => {
          showMessage("Your account has been linked successfully", "info");
          switchToUnlink();
        })
        .catch((error) => {
          let message;
          switch (error.code) {
            case "auth/popup-closed-by-user":
              message =
                "Popup was closed by the user before the linking process could be completed.";
              break;
            case "auth/popup-blocked":
              message =
                "Popup was blocked by the browser. Please ensure popups are allowed.";
              break;
            case "auth/account-exists-with-different-credential":
              message =
                "An account with different credentials already exists. You might need to link accounts.";
              break;
            case "auth/credential-already-in-use":
              message =
                "Credentials are already in use. The provided credentials are associated with another account.";
              break;
            case "auth/operation-not-allowed":
              message =
                "Account linking is not allowed. Please contact support for assistance.";
              break;
            case "auth/internal-error":
              message =
                "An internal error occurred during the linking process. Please try again later.";
              break;
            default:
              message =
                "An error occurred while linking accounts. Please try again.";
          }
          showMessage(message, "error");
        });
    }
  });
  //* ----------------- Delete Account -----------------
  const deleteAccountButton = document.getElementById("delete_account");
  deleteAccountButton.addEventListener("click", async () => {
    // Set the verification action
    verifyUserContainer.querySelector("#action").textContent =
      "deleting your account";
    // Show the verification container
    verifyUserContainer.classList.add("show");
    // Reauthenticate the user
    reauthenticate(async () => {
      const storage = getStorage();
      Promise.all([
        ["Favorites", "watchList", "Episodes"].map((document) => {
          deleteDoc(doc(db, document, auth.currentUser.uid));
        }, deleteObject(ref(storage, `usersProfiles/${auth.currentUser.uid}.png`))),
      ]).then(() => {
        // Delete the user account after deleting the their data
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
  });
};

//* Export
export {
  showPassword,
  isValidPassword,
  showMessage,
  checkIfUserIsLoggedIn,
  handleUserAuth,
  handleAccount,
  toggleList,
  closeList,
  displayShow,
  displayList,
  removeFromList,
  clearList,
  sortList,
  searchList,
  showSearchInput,
  hideSearchInput,
  updateLocalStorageOrDatabase,
  retrieveFromLocalStorageOrDatabase,
  storeInLocalStorageOrDatabase,
};
