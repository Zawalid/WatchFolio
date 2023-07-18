"use strict";
// TODO: Make this script a module
//* ------------------------------ WatchLists ------------------------------ *//
const watchListContainer = document.getElementById("watchList");
const listsButtons = document.querySelectorAll("#listsButtons button");
const actions = document.getElementById("actions");
let currentListShows = [...watchListContainer.querySelectorAll("a")];

//* Toggle the watchList
document.querySelectorAll("#watchList_toggler").forEach((toggler) => {
  toggler.addEventListener("click", function () {
    // Display the shows from the watched list by default
    displayShowsFromWatchList(watchLists.watched.name);
    watchListContainer.classList.toggle("show");
    // Check if the user is on the show page and add the overflow-hidden class to the body to prevent scrolling when the watchList is open
    !watchListContainer.classList.contains("show") &&
    window.location.pathname.includes("show.html")
      ? document.body.classList.remove("h-screen", "overflow-hidden")
      : document.body.classList.remove("overflow-hidden");
    // Switch the actions to the navbar if the watchList is open and the media query matches
    if (window.matchMedia("(max-width: 768px)").matches) {
      document.getElementById("nav").appendChild(actions);
      actions.classList.toggle("hidden");
    } else {
      document.getElementById("watchList").appendChild(actions);
      actions.classList.remove("hidden");
    }
    // Add the active class to the toggler
    window.matchMedia("(max-width: 768px)").matches
      ? this.classList.add("active")
      : this.firstElementChild.classList.add("active");
    // Scroll to the top of the page when the watchList is open on mobile
    if (window.matchMedia("(max-width: 768px)").matches) {
      window.scrollTo(0, 0);
      watchListContainer.classList.contains("show") &&
        document.body.classList.add("h-screen", "overflow-hidden");
    }
  });
});
//* Close the watchList when clicking outside of it
document.addEventListener("click", (e) => {
  if (
    !watchListContainer.contains(e.target) &&
    !e.target.closest("#watchList_toggler") &&
    !e.target.closest("#downloadList") &&
    !actions.contains(e.target)
  ) {
    watchListContainer.classList.remove("show");
    // Remove the active class from the toggler
    document.querySelectorAll("#watchList_toggler").forEach((toggler) => {
      window.matchMedia("(max-width: 768px)").matches
        ? toggler.classList.remove("active")
        : toggler.firstElementChild.classList.remove("active");
    });
  }
});
//* WatchLists (watched, watching, willWatch)
const watchLists = {
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
//* Add to the chosen list
const addToWatchList = (id, list) => {
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
const removeFromWatchList = (id, list) => {
  // Delete the id to from chosen list
  list.shows.delete(id);
  // Update the list in the local storage
  window.localStorage.setItem(list.name, [...list.shows]);
};
//* Display shows from the chosen list
const displayShowsFromWatchList = async (list) => {
  listsButtons.forEach((button) => button.classList.remove("active"));
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

  const getShow = async (id) => {
    const res = await fetch(`https://api.tvmaze.com/shows/${id}`);
    const show = await res.json();
    return show;
  };
  const displayShow = async (id) => {
    const show = await getShow(id);
    return `
    <div class="flex items-center justify-between" >
  <a href="show.html?id=${show.id}" class="flex items-center gap-3 " >
  <img src="${
    show.image.medium || "./imgs/placeholder.png"
  }" alt="" class="w-[100px] rounded-lg" >
  <h3 class="text-textColor font-bold text-lg">${show.name} </h3>
  </a>
  <i class="fa-solid fa-trash text-textColor2 transition-colors hover:text-secondaryAccent duration-300 text-lg cursor-pointer" id="removeFromList"></i>
  </div>
  `;
  };
  const emptyList = `
  <div class="flex flex-col items-center h-full justify-center ">
  <img src="./imgs/undraw_no_data_re_kwbl.svg" alt="" class="w-[120px] mb-5">
  <h2 class="font-bold text-textColor2 text-lg">List is empty</div>
  </div>
  `;
  let html =
    showsIds.size > 0
      ? (await Promise.all([...showsIds].map((id) => displayShow(id)))).join("")
      : emptyList;

  watchListContainer.querySelector("#shows").innerHTML = html;
  currentListShows = [...watchListContainer.querySelectorAll("a")];
};
//* Remove from the chosen list when clicking on the trash icon
document.addEventListener("click", (e) => {
  if (e.target.closest("#removeFromList")) {
    // Get the id of the show to remove by getting the href of the show link
    const id = e.target
      .closest("#removeFromList")
      .previousElementSibling.href.split("=")[1];
    // Get the current list from the dataset to use it to remove the show from the right list
    const list = watchListContainer.dataset.current_list;
    // Check if the user is on the show page and change the button text to the default one
    window.location.pathname.includes("show.html") &&
      document
        .getElementById("overview")
        .querySelectorAll("button")
        .forEach((button) => {
          if (button.dataset.list == list) {
            button.innerHTML = watchLists[list].defaultButton;
          }
        });
    // Remove the show from the list
    removeFromWatchList(id, watchLists[list]);
    // Display the shows from the list
    displayShowsFromWatchList(list);
  }
});
//* Show the shows from the selected list and change the active button
listsButtons.forEach((button) => {
  button.addEventListener("click", function () {
    // Remove the active class from all the buttons
    listsButtons.forEach((button) => button.classList.remove("active"));
    // Add the active class to the clicked button
    this.classList.add("active");
    // Update the current list in the dataset to use to know which list is the current one
    watchListContainer.dataset.current_list = this.dataset.list;
    // Display the shows from the selected list
    displayShowsFromWatchList(watchLists[this.dataset.list].name);
  });
});
//* Retrieve shows from local storage and store them back in the lists to manipulate them
const retrieveAndStoreLists = (list, listName) => {
  // Get the shows from the local storage
  const lists = window.localStorage.getItem(listName)?.split(",");
  // Remove the empty string from the array (it's added when the list is empty)
  lists[0] == "" && lists.splice(0, 1);
  // Store the shows in the list to manipulate them
  list.shows = new Set(lists);
};
retrieveAndStoreLists(watchLists.watched, "watched");
retrieveAndStoreLists(watchLists.watching, "watching");
retrieveAndStoreLists(watchLists.willWatch, "willWatch");

//* ------------------------------ Actions ------------------------------ *//

//* ------------------------------ Download ------------------------------ *//
const downloadWatchListContainer = document.getElementById("downloadList");
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
const clearConfirmation = document.getElementById("clear_confirmation");
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
const searchListInput = document.getElementById("search_list");
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
      <img src="./imgs/no result search icon.png" alt="" class="w-52" />
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
