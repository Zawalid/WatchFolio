"use strict";

//* ------------------ Imports ------------------ *//
// watchLists
import "./watchList.js";
// TMDB API
import { options } from "./TMDB.js";
// Firebase
import firebase from "./firebaseApp.js";

//* Initialize the watchLists if they don't exist
["watched", "watching", "willWatch"].forEach((list) => {
  !window.localStorage.getItem(list) && window.localStorage.setItem(list, "");
});

//* Render the show's html
const renderShow = (show) => {
  return `
  <a href="show.html?id=${show?.id}">
  <div class="w-[210px] h-[270px] peer group relative overflow-hidden max-md:w-[140px] max-md:h-[200px]">
    <img
      src="${show?.image?.medium || "./imgs/placeholder.png"}"
      alt="${show?.name}"
      class="w-full h-full object-cover rounded-md shadow-shadow1 mb-2"
    />
    <div
      class="blur-[60px] top-0 absolute -z-10 flex h-full w-full flex-col gap-3 bg-dark p-3 transition-all duration-[.8s] group-hover:z-10 group-hover:bg-dark group-hover:bg-opacity-50 group-hover:blur-0"
    >
      <div
        class="w-fit rounded-lg bg-thirdAccent px-3 text-sm font-semibold text-textColor"
      >
        ${show?.genres[0] || "No genre"}
      </div>
      <div
        class="flex w-fit items-center gap-1 rounded-lg bg-secondaryAccent px-3 text-sm font-semibold text-textColor"

      >
        ${
          show?.rating.average || "Not rated"
        } <i class="fa-solid fa-star text-primaryAccent"></i>
      </div>
      <h3 class="mt-auto font-logo text-lg font-bold text-textColor">
        ${show?.name}
      </h3>
    </div>
  </div>
</a>
  `;
};

//* ------------------------------ Search ------------------------------ *//
const searchResultsContainer = document.getElementById("search_results");
const searchInput = document.getElementById("search_input");
const searchBtn = document.getElementById("search_button");

const somethingWrong = `
<div class="flex flex-col items-center justify-center col-span-5 h-full">
<img src="./imgs/wrong.svg" alt="" class="h-64 w-64" />
<h2 class="mb-3 text-xl font-bold text-thirdAccent">Something went wrong</h2>
<h3 class="font-semibold text-textColor2 text-center">
  Please try again later
</h3>
</div>
`;
//* Display the results of the search
const displayResults = async (query) => {
  try {
    // Show the loading spinner
    searchResultsContainer.innerHTML = `
    <i
    class="fa-solid fa-spinner absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-4xl text-thirdAccent"
  ></i>
    `;
    // Fetch the data
    const res = await fetch(` https://api.tvmaze.com/search/shows?q=${query}`);
    //   Convert the response to json
    const data = await res.json();

    // If there are no results
    const noResults = `
  <div class="flex flex-col items-center justify-center col-span-5">
  <img src="./imgs/no_result.png" alt="" class="h-64 w-44" />
  <h2 class="mb-3 text-xl font-bold text-thirdAccent">No Results Found</h2>
  <h3 class="font-semibold text-textColor2 text-center">
    We couldn't find any show matching your search
  </h3>
</div>
  `;
    if (data.length === 0) {
      searchResultsContainer.innerHTML = noResults;
      return;
    }
    // Clear the container
    searchResultsContainer.innerHTML = "";
    // Loop through the data array and create the each show element
    for (const obj of data) {
      // Get the show object from the data array
      const { show } = obj;
      // Create the elements
      const html = renderShow(show);
      searchResultsContainer.innerHTML += html;
    }
  } catch {
    searchResultsContainer.innerHTML = somethingWrong;
  }
};
//* Search for the show the user entered
const search = (e) => {
  // If the user presses enter or clicks the search button
  searchResultsContainer.classList.replace("hidden", "flex");
  // Scroll to the container
  searchResultsContainer.scrollIntoView({ behavior: "smooth" });
  // Display the data
  displayResults(searchInput.value);
};
//* If the search input is empty
const nothingToSearch = () => {
  if (searchInput.value === "") {
    searchResultsContainer.classList.replace("grid", "hidden");
    searchResultsContainer.innerHTML = "";
    searchInput.blur();
  }
};
//* Event listeners
[search, nothingToSearch].forEach((func) => {
  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") func();
  });
  searchBtn.addEventListener("click", func);
});

//* ------------------------------ Explore ------------------------------ *//
const exploreContainer = document.querySelector("#explore #shows");
const tabsButtons = document.querySelectorAll("#exploreTabs button");
const pagination = document.querySelector("#explore #pagination");

//* Get the explore shows (trending, popular, top rated)
const explore = async (url, page = null) => {
  try {
    // Show the loading spinner
    exploreContainer.innerHTML = `
    <i
    class="fa-solid fa-spinner absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-4xl text-thirdAccent"
  ></i>
    `;
    // Get the shows according to the url
    const res = await fetch(
      `https://api.themoviedb.org/3/${url}${page ? `?page=${page}` : ""}`,
      options
    );
    const tvShows = await res.json();
    // Get the info of each show using the TVmaze API
    const html = await Promise.all(
      tvShows.results.map(async (tvShow) => {
        try {
          const res = fetch(
            `https://api.tvmaze.com/singlesearch/shows?q=${tvShow.name}`
          );
          const show = await (await res).json();
          if (!show?.name || show.genres.includes("Anime")) return;
          return renderShow(show);
        } catch {}
      })
    );
    exploreContainer.innerHTML = html.join("");
  } catch {
    exploreContainer.innerHTML = somethingWrong;
  }
};

//* Get the trending shows by default
explore("trending/tv/day");

//* Switch between the tabs (trending, popular, top rated)
tabsButtons.forEach((button) => {
  button.addEventListener("click", function () {
    // Remove the active class from all the buttons
    tabsButtons.forEach((button) => button.classList.remove("active"));
    // Add the active class to the clicked button
    this.classList.add("active");
    // Get the url of the clicked button
    const url = this.dataset.url;
    // Get the name of the clicked button and check if it's trending or not to show/hide the pagination
    const name = this.dataset.name;
    if (name === "trending") {
      pagination.classList.replace("flex", "hidden");
    } else {
      pagination.classList.replace("hidden", "flex");
      // Set the numbers buttons to 1, 2, 3, 4, 5
      pagination
        .querySelectorAll("#numbers button")
        .forEach((btn, i) => (btn.innerText = i + 1));
      // Add the active class to the first button
      addActiveClass(pagination.querySelectorAll("#numbers button")[0]);
      // REduce the opacity of the prev and first buttons if the current page is 1
      currentPage = 1;
      reduceOpacity(1, [paginationButtons[0], paginationButtons[1]]);
    }
    // Get the explore shows (trending, popular, top rated) with the page null to get the first page
    explore(url);
  });
});

//* ------------------------------ Pagination ------------------------------ *//
const paginationButtons = document.querySelectorAll("#pagination button");
let currentPage = +pagination.dataset.current_page;

//* Add the active class to the current page button and remove it from the rest
const addActiveClass = (button) => {
  pagination
    .querySelectorAll("#numbers button")
    .forEach((b) => b.classList.remove("active"));
  button.classList.add("active");
};

//* Reduce the opacity of the prev and first buttons if the current page is 1 and of the next and last buttons if the current page is the last page
const reduceOpacity = (page, buttons) => {
  currentPage === page
    ? buttons.forEach((btn) => (btn.style.opacity = ".5"))
    : buttons.forEach((btn) => (btn.style.opacity = "1"));
};
reduceOpacity(1, [paginationButtons[0], paginationButtons[1]]);

//* Switch between the pages
pagination.addEventListener("click", async function (e) {
  if (e.target.closest("button")) {
    // Get the clicked button
    const button = e.target.closest("button");
    // Get the url of the active tab
    const url = document.querySelector("#exploreTabs .active").dataset.url;
    // Get the numbers buttons
    const numbersButtons = [...pagination.querySelectorAll("#numbers button")];
    // Get the last page number
    const res = await fetch(`https://api.themoviedb.org/3/${url}`, options);
    const data = await res.json();
    //! The API insists that the page number should be 500 or less
    const lastPage = data.total_pages > 500 ? 500 : data.total_pages;
    // Check if the clicked button is the first, last, prev, next or a number button
    if (button.id === "first") {
      // Return if the current page is 1
      if (currentPage === 1) return;
      // Set the current page to 1
      currentPage = 1;
      // Set the numbers buttons to 1, 2, 3, 4, 5
      numbersButtons.forEach((btn, i) => (btn.innerText = i + 1));
    } else if (button.id === "last") {
      // Return if the current page is the last page
      if (currentPage === lastPage) return;
      // Set the current page to the last page
      currentPage = lastPage;
      // Set the numbers buttons to the last 5 pages
      numbersButtons.forEach(
        (_, i, arr) => (arr.toReversed()[i].innerText = lastPage - i)
      );
    } else if (button.id === "prev") {
      // Return if the current page is 1
      if (currentPage === 1) return;
      else {
        // Decrease the current page by 1
        currentPage--;
        // Decrease the numbers buttons by 1 if the current page is not 1
        numbersButtons.find((btn) => +btn.innerText === 1) ||
          numbersButtons.forEach((btn) => +btn.innerText--);
      }
    } else if (button.id === "next") {
      // Return if the current page is the last page
      if (currentPage === lastPage) return;
      else {
        // Increase the current page by 1
        currentPage++;
        // Increase the numbers buttons by 1 if the current page is not the last page
        numbersButtons.find((btn) => +btn.innerText === lastPage) ||
          numbersButtons.forEach((btn) => +btn.innerText++);
      }
    } else {
      // Set the current page to the clicked button number
      currentPage = +button.innerText;
      // Check if the clicked button is not the first or last button
      if (+button.innerText !== 1 && +button.innerText !== lastPage) {
        // Get the index of the clicked button and check which side it's on to increase or decrease the numbers buttons
        const buttonIndex = numbersButtons.indexOf(button);
        if (
          buttonIndex > 2 &&
          !numbersButtons.find((btn) => +btn.innerText === lastPage)
        ) {
          // Remove the first button and add a new button with the number after the last button
          numbersButtons[0].remove();
          document.getElementById("numbers").insertAdjacentHTML(
            "beforeend",
            `
        <button
        class="h-10 w-10 rounded-full bg-dark text-center font-bold text-textColor transition-colors duration-300 hover:bg-secondaryAccent"
      >
        ${+numbersButtons[4].innerText + 1}
      </button>
        `
          );
        } else if (
          buttonIndex < 2 &&
          !numbersButtons.find((btn) => +btn.innerText === 1)
        ) {
          // Remove the last button and add a new button with the number before the first button
          numbersButtons[4].remove();
          // Add the new button before the first button
          document.getElementById("numbers").insertAdjacentHTML(
            "afterbegin",
            `
        <button
        class="h-10 w-10 rounded-full bg-dark text-center font-bold text-textColor transition-colors duration-300 hover:bg-secondaryAccent"
      >
        ${+numbersButtons[0].innerText - 1}
      </button>
        `
          );
        }
      }
    }
    reduceOpacity(1, [paginationButtons[0], paginationButtons[1]]);
    reduceOpacity(lastPage, [paginationButtons[7], paginationButtons[8]]);
    // Add the active class to the current page button
    addActiveClass(
      numbersButtons.find((btn) => +btn.innerText === currentPage)
    );
    // Get the explore shows (trending, popular, top rated) with the page number
    explore(url, currentPage);
  }
});

//* ------------------------------ Register the service worker ------------------------------ *//
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./service-worker.js")
    .then((registration) => {})
    .catch((err) => {
      console.log("Service Worker Failed to Register", err);
    });
}

//* ------------------------------ Authentication ------------------------------ *//

firebase.auth().onAuthStateChanged((user) => {
  console.log(user);
  if (user) {
    //  Send verification email if the user is not verified
    if (!user.emailVerified) {
      const verificationMessage = document.getElementById("email_verification");
      verificationMessage.classList.replace("-top-[150px]", "top-5");
      setTimeout(() => {
        verificationMessage.classList.replace("top-5", "-top-[150px]");
      }, 5000);
      user.sendEmailVerification().catch((err) => console.log(err));
    }
  }
});
