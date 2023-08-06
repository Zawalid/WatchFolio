"use strict";

//* ------------------------- Imports ------------------------- *//
import {
  toggleList,
  closeList,
  displayShow,
  displayList,
  removeFromList,
} from "./utilities.js";


//* ------------------------------ Main logic ------------------------------ *//
const favoritesListContainer = document.getElementById("favoritesList");
const actions = favoritesListContainer.querySelector("#actions");
const favoritesListButtons = document.querySelectorAll(
  "#favoritesListButtons button"
);
let currentListFavorites = [
  ...favoritesListContainer.querySelectorAll("[data-id]"),
];

//* FavoritesList (Shows, Seasons, Episodes)
export const favoritesList = {
  shows: {
    name: "favoriteShows",
    list: new Set(),
    activeButton: `<i class="fa-solid fa-heart"></i> Favorite`,
    defaultButton: `<i class="fa-solid fa-heart"></i> Add To Favorites`,
  },
  seasons: {
    name: "favoriteSeasons",
    list: new Set(),
    defaultButton: `<i class="fa-solid fa-heart"></i> Add To Favorites`,
    activeButton: `<i class="fa-solid fa-heart"></i> Favorite`,
  },
  episodes: {
    name: "favoriteEpisodes",
    list: new Set(),
    defaultButton: `<i class="fa-solid fa-heart"></i> Add To Favorites`,
    activeButton: `<i class="fa-solid fa-heart"></i> Favorite`,
  },
};
//* Retrieve shows from local storage and store them back in the lists to manipulate them
for (let list in favoritesList) {
  list = favoritesList[list];
  const lists = window.localStorage.getItem(list.name)?.split(",");
  // Remove the empty string from the array (it's added when the list is empty)
  lists && lists[0] == "" && lists.splice(0, 1);
  // Store the shows/seasons/episodes back in the lists
  list.list = new Set(lists);
  console.log(favoritesList);
}
//* Add to favoritesList
export const addToFavoritesList = (id, type) => {
  // Add to the right type of favorites list
  favoritesList[type].list.add(id);
  //   update the lists in the local storage
  [favoritesList.shows, favoritesList.seasons, favoritesList.episodes].forEach(
    (set) => {
      window.localStorage.setItem(set.name, [...set.list]);
    }
  );
};
//* Remove from favoritesList
export const removeFromFavoritesList = (id, type) => {
  // Remove from the right type of favorites list
  type.list.delete(id);
  //   update the list in the local storage
  window.localStorage.setItem(type.name, [...type.list]);
};
//* Display shows, seasons, episodes from the favoritesList
const displayFromFavoritesList = async (type) => {
  favoritesListButtons.forEach((button) => {
    button.classList.remove("active");
  });
  favoritesListContainer
    .querySelector(`button[data-favorite='${type}'`)
    .classList.add("active");

  const ids = favoritesList[type].list;
  // Disable the actions if the list is empty except the download button
  ids.size === 0
    ? [...actions.querySelectorAll("i")].forEach((i) => {
        i.classList.replace("text-textColor2", "text-[darkslategray]");
        i.classList.replace("cursor-pointer", "cursor-not-allowed");
      })
    : [...actions.querySelectorAll("i")].forEach((i) => {
        i.classList.replace("text-[darkslategray]", "text-textColor2");
        i.classList.replace("cursor-not-allowed", "cursor-pointer");
      });

  // Display the season
  const displaySeason = async (id) => {
    const res = await fetch(`https://api.tvmaze.com/seasons/${id}`);
    const season = await res.json();
    // Get the show name from the url
    const showName = season.url
      .split("season")[1]
      .split("/")[2]
      .split("-")
      .map((a) => a.charAt(0).toUpperCase() + a.slice(1))
      .join(" ");

    return `
        <div class="flex items-center justify-between" >
      <div class="flex items-center gap-3 " data-id="${season.id}">
      <img src="${
        season.image?.medium || show.image?.medium || "./imgs/placeholder.png"
      }" alt="" class="w-[100px] rounded-lg" >
      <div>
      <h3 class="text-textColor font-bold text-lg">${
        season.name || "Season " + season.number
      } 
      <span class="text-textColor2 text-sm font-semibold mt-2 block">${showName} - ${
      season.premiereDate.split("-")[0]
    } </span>
    </h3>
      </div>
      </div>
      <i class="fa-solid fa-trash text-textColor2 transition-colors hover:text-secondaryAccent duration-300 text-lg cursor-pointer" id="removeFromFavoriteList"></i>
      </div>
      `;
  };
  // Display the episode
  const displayEpisode = async (id) => {
    const res = await fetch(`https://api.tvmaze.com/episodes/${id}`);
    const episode = await res.json();
    // Get the show name from the url
    const regex = /\/([^\/]+)-\d+x\d+/;
    const match = episode.url.match(regex);
    const showName = match[1]
      .split("-")
      .map((a) => a.charAt(0).toUpperCase() + a.slice(1))
      .join(" ");

    return `
        <div class="flex items-center justify-between" >
        <div class="flex items-center gap-3 " data-id="${episode.id}">
        <img src="${
          episode.image?.medium || "./imgs/placeholder.png"
        }" alt="" class="w-[100px] rounded-lg" >
        <div>
      <h3 class="text-textColor font-bold text-lg h-7 overflow-y-auto">${
        episode.name || "Episode " + episode.number
      } </h3>
      <span class="block text-textColor2 text-sm font-semibold mt-2">
      Season ${episode.season} - Episode ${episode.number} </span>
      <span class="block text-textColor2 text-sm font-semibold mt-2">${showName} - ${
      episode.airdate.split("-")[0]
    } </span>

      </div>
      </div>
      <i class="fa-solid fa-trash text-textColor2 transition-colors hover:text-secondaryAccent duration-300 text-lg cursor-pointer" id="removeFromFavoriteList"></i>
      </div>
      `;
  };
  // Empty list
  const emptyList = `
<div class="flex flex-col items-center h-full justify-center ">
<img src="./imgs/undraw_no_data_re_kwbl.svg" alt="" class="w-[120px] mb-5">
<h2 class="font-bold text-textColor2 text-lg">List is empty</div>
</div>
`;

  let html =
    ids.size > 0
      ? (
          await Promise.all(
            [...ids].map((id) => {
              switch (type) {
                case "shows":
                  return displayShow(id, favoritesListContainer);
                case "seasons":
                  return displaySeason(id);
                case "episodes":
                  return displayEpisode(id);
              }
            })
          )
        ).join("")
      : emptyList;

  favoritesListContainer.querySelector("#favorites").innerHTML = html;

  currentListFavorites = [
    ...favoritesListContainer.querySelectorAll("[data-id]"),
  ];
};
//* Show the elements from the selected list and change the active button
displayList(
  favoritesListButtons,
  favoritesListContainer,
  "favorite",
  displayFromFavoritesList
);
//* Remove from the chosen list when clicking on the trash icon
removeFromList(
  "removeFromFavoriteList",
  favoritesListContainer,
  "favorite",
  favoritesList,
  displayFromFavoritesList,
  removeFromFavoritesList
);
//* Toggle favoritesList
toggleList(
  "favoritesList_toggler",
  favoritesListContainer,
  "shows",
  actions,
  displayFromFavoritesList
);
//* Close the favoritesList when clicking outside of it
closeList("favoritesList_toggler", favoritesListContainer, actions);

//* ------------------------- Actions ------------------------- *//

//* ------------------------------ CLear ------------------------------ *// !---> Function
//* Clear the watchList
const clearConfirmation = favoritesListContainer.querySelector(
  "#clear_confirmation"
);
const clearWatchList = () => {
  // SHow confirmation modal
  favoritesList[favoritesListContainer.dataset.current_favorite].list.size >
    0 && clearConfirmation.classList.replace("hidden", "flex");
  clearConfirmation.addEventListener("click", (e) => {
    if (e.target.closest("#no")) {
      clearConfirmation.classList.replace("flex", "hidden");
    }
    if (e.target.closest("#yes")) {
      clearConfirmation.classList.replace("flex", "hidden");
      const currentList = favoritesListContainer.dataset.current_favorite;
      // Clear the list from the local storage
      window.localStorage.setItem(favoritesList[currentList].name, "");
      // Clear the list from the favoriteList object
      favoritesList[currentList].list.clear();
      // Display the shows from the list
      displayFromFavoritesList(currentList);
      // Check if the user is on the show page and change the button text to the default one
      // window.location.pathname.includes("show.html") &&
      //   document
      //     .getElementById("overview")
      //     .querySelectorAll("button")
      //     .forEach((button) => {
      //       if (button.dataset.list == currentList) {
      //         button.innerHTML = watchLists[currentList].defaultButton;
      //       }
      //     });
    }
  });
};
actions.querySelector("#clear").addEventListener("click", clearWatchList);

//* ------------------------------ Sort ------------------------------ *//
//* Sort the watchList
const sortFavoriteList = (direction) => {
  // To store the sorted list
  let sortedList = [];
  // To store the sorted names of shows
  let sortedNames;
  // The sorted list by names based on the direction (AZ/ZA)
  if (direction === "AZ") {
    sortedNames = currentListFavorites
      .map((a) => a.querySelector("h3").textContent)
      .toSorted();
  } else {
    sortedNames = currentListFavorites
      .map((a) => a.querySelector("h3").textContent)
      .toSorted()
      .toReversed();
  }
  console.log(sortedNames);
  const sort = () => {
    sortedList.push(
      currentListFavorites.find(
        (a) => a.querySelector("h3").textContent == sortedNames[0]
      ).parentElement
    );
    sortedNames.shift();
  };
  // Sort the list (Fill the sortedList array)
  currentListFavorites.forEach((e) => sort());
  // Insert the sorted shows
  const html = sortedList.map((el) => el.outerHTML).join("");
  sortedList.length > 0
    ? (favoritesListContainer.querySelector("#favorites").innerHTML = html)
    : "";
};
//* Sort from A to Z
actions
  .querySelector("#sortAZ")
  .addEventListener("click", () => sortFavoriteList("AZ"));
//* Sort from Z to A
actions
  .querySelector("#sortZA")
  .addEventListener("click", () => sortFavoriteList("ZA"));

//* ------------------------------ Search ------------------------------ *// !---> Function
//* Search for a show
const searchListInput = favoritesListContainer.querySelector("#search_list");
const searchFavoriteList = () => {
  // Get the query and convert it to lowercase
  const query = searchListInput.value.toLowerCase();
  // Filter the shows based on the query
  const results = currentListFavorites.filter((a) => {
    return a.querySelector("h3").textContent.toLowerCase().includes(query);
  });
  // Display the results or a message if there are no results
  favoritesListContainer.querySelector("#favorites").innerHTML =
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
  favoritesList[favoritesListContainer.dataset.current_favorite].list.size >
    0 && searchListInput.classList.toggle("show");
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
    searchFavoriteList();
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
