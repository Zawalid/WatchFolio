"use strict";

//* ------------------------------ Imports ------------------------------ *//
import { downloadList, downloadWatchListContainer } from "./download.js";

import {
  closeList,
  toggleList,
  displayShow,
  displayList,
  removeFromList,
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
  const lists = window.localStorage.getItem(list.name)?.split(",");
  // Remove the empty string from the array (it's added when the list is empty)
  lists && lists[0] == "" && lists.splice(0, 1);
  // Store the shows/seasons/episodes back in the lists
  list.shows = new Set(lists);
}
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
  list.add(id);
  // Update the lists in the local storage
  [watchLists.watched, watchLists.watching, watchLists.willWatch].forEach((l) =>
    window.localStorage.setItem(l.name, [...l.shows])
  );
};
//* Remove from the chosen list
export const removeFromWatchList = (id, list) => {
  // Delete the id to from chosen list
  list.shows.delete(id);
  // Update the list in the local storage
  window.localStorage.setItem(list.name, [...list.shows]);
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
  "watched",
  actions,
  displayShowsFromWatchList
);
//* Close the watchList when clicking outside of it
closeList("watchList_toggler", watchListContainer, actions);

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
//* Clear the watchList
const clearConfirmation = watchListContainer.querySelector(
  "#clear_confirmation"
);
const clearWatchList = () => {
  // SHow confirmation modal
  watchLists[watchListContainer.dataset.current_list].shows.size > 0 &&
    clearConfirmation.classList.replace("hidden", "flex");
  clearConfirmation.addEventListener("click", (e) => {
    if (e.target.closest("#no")) {
      clearConfirmation.classList.replace("flex", "hidden");
    }
    if (e.target.closest("#yes")) {
      clearConfirmation.classList.replace("flex", "hidden");
      const currentList = watchListContainer.dataset.current_list;
      // Clear the list from the local storage
      window.localStorage.setItem(currentList, "");
      // Clear the list from the watchLists object
      watchLists[currentList].shows.clear();
      // Display the shows from the list
      displayShowsFromWatchList(currentList);
      // Check if the user is on the show page and change the button text to the default one
      window.location.pathname.includes("show.html") &&
        document
          .getElementById("overview")
          .querySelectorAll("button")
          .forEach((button) => {
            if (button.dataset.list == currentList) {
              button.innerHTML = watchLists[currentList].defaultButton;
            }
          });
    }
  });
};
actions.querySelector("#clear").addEventListener("click", clearWatchList);

//* ------------------------------ Sort ------------------------------ *//
//* Sort the watchList
const sortWatchList = (direction) => {
  // To store the sorted list
  let sortedList = [];
  // To store the sorted names of shows
  let sortedNames;
  // The sorted list by names based on the direction (AZ/ZA)
  if (direction === "AZ") {
    sortedNames = currentListShows
      .map((a) => a.lastElementChild.textContent)
      .toSorted();
  } else {
    sortedNames = currentListShows
      .map((a) => a.lastElementChild.textContent)
      .toSorted()
      .toReversed();
  }

  const sort = () => {
    sortedList.push(
      currentListShows.find(
        (a) => a.querySelector("h3").textContent == sortedNames[0]
      ).parentElement
    );
    sortedNames.shift();
  };
  // Sort the list
  currentListShows.forEach((e) => sort());
  // Insert the sorted shows
  const html = sortedList.map((el) => el.outerHTML).join("");
  sortedList.length > 0
    ? (watchListContainer.querySelector("#shows").innerHTML = html)
    : "";
};
//* Sort from A to Z
actions
  .querySelector("#sortAZ")
  .addEventListener("click", () => sortWatchList("AZ"));
//* Sort from Z to A
actions
  .querySelector("#sortZA")
  .addEventListener("click", () => sortWatchList("ZA"));

//* ------------------------------ Search ------------------------------ *//
//* Search for a show
const searchListInput = watchListContainer.querySelector("#search_list");
const searchWatchList = () => {
  // Get the query and convert it to lowercase
  const query = searchListInput.value.toLowerCase();
  // Filter the shows based on the query
  const results = currentListShows.filter((a) => {
    return a.lastElementChild.textContent.toLowerCase().includes(query);
  });
  // Display the results or a message if there are no results
  watchListContainer.querySelector("#shows").innerHTML =
    results.length > 0
      ? results.map((res) => res.parentElement.outerHTML).join("")
      : `<div class="flex flex-col items-center justify-center col-span-5 ml-[50%] mt-[50%] -translate-x-1/2 -translate-y-1/2">
      <img src="./imgs/no_result.png" alt="" class="w-52" />
      <h2 class="text-xl font-bold text-textColor2">No Shows Found</h2>
      </div>
      `;
};
//* Show the search input when clicking on the search icon
actions.querySelector("#search").addEventListener("click", function () {
  // Toggle the search input
  watchLists[watchListContainer.dataset.current_list].shows.size > 0 &&
    searchListInput.classList.toggle("show");
  // Focus or blur out of the input
  searchListInput.classList.contains("show")
    ? searchListInput.focus()
    : searchListInput.blur();
  // Change the icon
  searchListInput.classList.contains("show")
    ? this.classList.replace(
        "fa-magnifying-glass-plus",
        "fa-magnifying-glass-minus"
      )
    : this.classList.replace(
        "fa-magnifying-glass-minus",
        "fa-magnifying-glass-plus"
      );
});
//* Search when pressing enter
searchListInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    // Search for the show
    searchWatchList();
    // Clear the input
    searchListInput.value = "";
    // Hide the input
    searchListInput.classList.remove("show");
    // Change the icon
    actions
      .querySelector("#search")
      .classList.replace(
        "fa-magnifying-glass-minus",
        "fa-magnifying-glass-plus"
      );
  }
});
