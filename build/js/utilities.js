//* Show password when eye icon is clicked
const showPassword = () => {
  document.addEventListener("click", (e) => {
    const button = document.getElementById("show_password");
    let input = document.querySelector("input[name='password']");
    if (e.target.id === "show_password") {
      if (input.type == "password" && input.value != "") {
        input.type = "text";
        button.className =
          "fa-solid fa-eye-slash absolute right-3 top-1/2 -translate-y-1/2  cursor-pointer text-sm text-textColor2";
      } else {
        input.type = "password";
        button.className =
          "fa-solid fa-eye absolute right-3 top-1/2 -translate-y-1/2  cursor-pointer text-sm text-textColor2";
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

export { showPassword, isValidPassword, showError };
