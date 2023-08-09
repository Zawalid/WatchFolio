"use strict";

//* ------------------------------ Imports ------------------------------ *//
import { downloadList, downloadWatchListContainer } from "./download.js";

import {
  closeList,
  toggleList,
  displayShow,
  displayList,
  removeFromList,
  clearList,
  sortList,
  searchList,
  showSearchInput,
  hideSearchInput,
  retrieveFromLocalStorageOrDatabase,
  storeInLocalStorageOrDatabase,
  updateLocalStorageOrDatabase,
} from "./utilities.js";

//* ------------------------------ Main logic ------------------------------ *//
const watchListContainer = document.getElementById("watchList");
const watchListButtons = document.querySelectorAll("#watchListButtons button");
const actions = watchListContainer.querySelector("#actions");
let currentListShows = [...watchListContainer.querySelectorAll("a")];

//* WatchLists (watched, watching, willWatch)
export const watchLists = {
  watched: {
    name: "watched",
    defaultButton: "I Watched",
    activeButton: `<i class="fa-solid fa-circle-check"></i> Watched`,
    shows: new Set(),
  },
  watching: {
    name: "watching",
    defaultButton: "I'm Watching",
    activeButton: `<i class="fa-solid fa-eye"></i> Watching`,
    shows: new Set(),
  },
  willWatch: {
    name: "willWatch",
    defaultButton: "I Will Watch",
    activeButton: `<i class="fa-solid fa-calendar-plus"></i> Will Watch`,
    shows: new Set(),
  },
};
//* Retrieve shows from local storage and store them back in the lists to manipulate them
for (let list in watchLists) {
  list = watchLists[list];
  // retrieve from database/local storage
  retrieveFromLocalStorageOrDatabase("watchList", list).then((res) => {
    // Check if the current show the user  is in is in the watchList and if so change the button
    res.shows.forEach((id) => {
      if (id === window.location.search.split("=")[1]) {
        document.querySelector(`[data-list=${list.name}]`).innerHTML =
          list.activeButton;
      }
    });
  });
}
//* Store the lists in the local storage or database if the lists don't exist
storeInLocalStorageOrDatabase("watchList", [
  "watched",
  "watching",
  "willWatch",
]);
//* Add to the chosen list
export const addToWatchList = (id, list) => {
  // Remove the id from the other lists if it exists
  [
    watchLists.watched.shows,
    watchLists.watching.shows,
    watchLists.willWatch.shows,
  ].forEach((l) => l.has(id) && l.delete(id));
  // Remove the active textContent from all the other lists
  [watchLists.watched, watchLists.watching, watchLists.willWatch].forEach(
    (list) =>
      (document.querySelector(`[data-list="${list.name}"]`).innerHTML =
        list.defaultButton)
  );
  // Add the id to the chosen list
  list.shows.add(id);
  // Update the lists in the local storage or database
  updateLocalStorageOrDatabase("watchList", [
    watchLists.watched,
    watchLists.watching,
    watchLists.willWatch,
  ]);
};
//* Remove from the chosen list
export const removeFromWatchList = (id, list) => {
  // Delete the id to from chosen list
  list.shows.delete(id);
  // Update the lists in the local storage or database
  updateLocalStorageOrDatabase("watchList", [
    watchLists.watched,
    watchLists.watching,
    watchLists.willWatch,
  ]);
};
//* Display shows from the chosen list
const displayShowsFromWatchList = async (list) => {
  watchListButtons.forEach((button) => button.classList.remove("active"));
  watchListContainer
    .querySelector(`button[data-list='${list}'`)
    .classList.add("active");

  const showsIds = watchLists[list].shows;
  // Disable the actions if the list is empty except the download button
  showsIds.size === 0
    ? [...actions.querySelectorAll("i")].slice(1).forEach((i) => {
        i.classList.replace("text-textColor2", "text-[darkslategray]");
        i.classList.replace("cursor-pointer", "cursor-not-allowed");
      })
    : [...actions.querySelectorAll("i")].slice(1).forEach((i) => {
        i.classList.replace("text-[darkslategray]", "text-textColor2");
        i.classList.replace("cursor-not-allowed", "cursor-pointer");
      });

  const emptyList = `
  <div class="flex flex-col items-center h-full justify-center ">
  <img src="./imgs/undraw_no_data_re_kwbl.svg" alt="" class="w-[120px] mb-5">
  <h2 class="font-bold text-textColor2 text-lg">List is empty</div>
  </div>
  `;
  let html =
    showsIds.size > 0
      ? (
          await Promise.all(
            [...showsIds].map((id) => displayShow(id, watchListContainer))
          )
        ).join("")
      : emptyList;

  watchListContainer.querySelector("#shows").innerHTML = html;
  currentListShows = [...watchListContainer.querySelectorAll("a")];
};
//* Remove from the chosen list when clicking on the trash icon
removeFromList(
  "removeFromWatchList",
  watchListContainer,
  "list",
  watchLists,
  displayShowsFromWatchList,
  removeFromWatchList
);
//* Show the elements from the selected list and change the active button
displayList(
  watchListButtons,
  watchListContainer,
  "list",
  displayShowsFromWatchList
);
//* Toggle the watchList
toggleList(
  "watchList_toggler",
  watchListContainer,
  actions,
  displayShowsFromWatchList
);
//* Close the watchList when clicking outside of it
closeList(
  "watchList_toggler",
  watchListContainer,
  actions,
  displayShowsFromWatchList
);

//* ------------------------------ Actions ------------------------------ *//

//* ------------------------------ Download ------------------------------ *//
//* Show the download watchList container
actions.querySelector("#download").addEventListener("click", (e) => {
  (window.matchMedia("(min-width: 768px)").matches &&
    document.body.classList.add("h-screen", "overflow-hidden")) ||
    window.scrollTo(0, 0);
  document.getElementById("listName").innerHTML =
    watchLists[watchListContainer.dataset.current_list].name;
  watchLists[watchListContainer.dataset.current_list].shows.size === 0 &&
    document
      .getElementById("emptyListWarning")
      .classList.replace("hidden", "flex");
  downloadWatchListContainer.classList.add("show");

  setTimeout(() => {
    document
      .getElementById("emptyListWarning")
      .classList.replace("flex", "hidden");
  }, 3000);
});
//* Close the download watchList container when clicking on the close button or the container and download the watchList when clicking on the download button
downloadWatchListContainer.addEventListener("click", function (e) {
  if (
    e.target.closest("#close") ||
    e.target === e.currentTarget ||
    e.target.closest("ul")
  ) {
    this.classList.remove("show");
    window.matchMedia("(min-width: 768px)").matches &&
    window.location.pathname.includes("show.html")
      ? document.body.classList.remove("h-screen", "overflow-hidden")
      : document.body.classList.remove("overflow-hidden");
    document
      .getElementById("downloadAllContainer")
      .classList.add("translate-y-full");
  }
  if (e.target.closest("#download")) {
    downloadList(
      [...this.querySelectorAll("input")].find((input) => input.checked).value,
      watchLists[watchListContainer.dataset.current_list]
    );
  }
  if (e.target.closest("#downloadAll")) {
    downloadList(
      [...this.querySelectorAll("input")].find((input) => input.checked).value,
      "all"
    );
  }
});

//* ------------------------------ CLear ------------------------------ *//
clearList(watchListContainer, watchLists, "list", displayShowsFromWatchList);
//* ------------------------------ Sort ------------------------------ *//
sortList(watchListContainer);

//* ------------------------------ Search ------------------------------ *//
const searchListInput = watchListContainer.querySelector("input");
//* Show the search input when clicking on the search icon
actions.querySelector("#search").addEventListener("click", () => {
  showSearchInput(watchListContainer, searchListInput, watchLists, "list");
});
//* Search when pressing enter
searchListInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    // Search for the show
    searchList(searchListInput, watchListContainer, currentListShows);
    // Hide the search input
    hideSearchInput(watchListContainer, searchListInput);
  }
});
