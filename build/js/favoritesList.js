"use strict";

//* ------------------------- Imports ------------------------- *//
import {
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
  },
  seasons: {
    name: "favoriteSeasons",
    list: new Set(),
  },
  episodes: {
    name: "favoriteEpisodes",
    list: new Set(),
  },
  defaultButton: `<i class="fa-solid fa-heart"></i> Add To Favorites`,
  activeButton: `<i class="fa-solid fa-heart"></i> Favorite`,
};
//* Retrieve shows from local storage/Database and store them in the lists
for (let list in favoritesList) {
  if (list === "defaultButton" || list === "activeButton") continue;
  list = favoritesList[list];
  // retrieve from database/local storage
  retrieveFromLocalStorageOrDatabase("Favorites", list).then((res) => {
    // Check if the current show the user  is in is in the favorite shows list and if so change the button
    if (res.name === "favoriteShows") {
      res.list.forEach((id) => {
        if (id === window.location.search.split("=")[1]) {
          document.querySelector(`#overview [data-favorite=shows]`).innerHTML =
            favoritesList.activeButton;
        }
      });
    }
  });
}
//* Store the lists in the local storage or database if the lists don't exist
storeInLocalStorageOrDatabase("Favorites", [
  "favoriteShows",
  "favoriteSeasons",
  "favoriteEpisodes",
]);
//* Add to favoritesList
export const addToFavoritesList = (id, type) => {
  // Add to the right type of favorites list
  type.list.add(id);
  //   update the list in the local storage or database
  updateLocalStorageOrDatabase("Favorites", [
    favoritesList.shows,
    favoritesList.seasons,
    favoritesList.episodes,
  ]);
};
//* Remove from favoritesList
export const removeFromFavoritesList = (id, type) => {
  // Remove from the right type of favorites list
  type.list.delete(id);
  //   update the list in the local storage or database
  updateLocalStorageOrDatabase("Favorites", [
    favoritesList.shows,
    favoritesList.seasons,
    favoritesList.episodes,
  ]);
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
        season.image?.medium || "./imgs/placeholder.png"
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
  actions,
  displayFromFavoritesList
);
//* Close the favoritesList when clicking outside of it
closeList(
  "favoritesList_toggler",
  favoritesListContainer,
  actions,
  displayFromFavoritesList
);

//* ------------------------- Actions ------------------------- *//

//* ------------------------------ CLear ------------------------------ *//
//* Clear the watchList
clearList(
  favoritesListContainer,
  favoritesList,
  "favorite",
  displayFromFavoritesList
);

//* ------------------------------ Sort ------------------------------ *//
sortList(favoritesListContainer);

//* ------------------------------ Search ------------------------------ *//
//* Search for a show
const searchListInput = favoritesListContainer.querySelector("input");

//* Show the search input when clicking on the search icon
actions.querySelector("#search").addEventListener("click", () => {
  showSearchInput(
    favoritesListContainer,
    searchListInput,
    favoritesList,
    "favorite"
  );
});
//* Search when pressing enter
searchListInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    // Search for the show
    searchList(searchListInput, favoritesListContainer, currentListFavorites);
    // Hide the search input
    hideSearchInput(favoritesListContainer, searchListInput);
  }
});
