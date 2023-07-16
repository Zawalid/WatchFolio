"use strict";

//* Initialize the watchLists if they don't exist
["watched", "watching", "willWatch"].forEach((list) => {
  !window.localStorage.getItem(list) && window.localStorage.setItem(list, "");
});

//* ------------------ Search ------------------ *//
const searchResultsContainer = document.getElementById("search_results");
const searchInput = document.getElementById("search_input");
const searchBtn = document.getElementById("search_button");

//* Display the results of the search
const displayResults = async (query) => {
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
  <img src="./imgs/no result search icon.png" alt="" class="h-64 w-64" />
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
    const html = `
    <a href="show.html?id=${show.id}">
    <div class="w-[210px] h-[270px] peer group relative overflow-hidden">
      <img
        src="${show.image?.medium || "./imgs/placeholder.png"}"
        alt="${show.name}"
        class="w-full h-full object-cover rounded-md shadow-shadow1 mb-2"
      />
      <div
        class="blur-[60px] top-0 absolute -z-10 flex h-full w-full flex-col gap-3 bg-dark p-3 transition-all duration-[.8s] group-hover:z-10 group-hover:bg-dark group-hover:bg-opacity-50 group-hover:blur-0"
      >
        <div
          class="w-fit rounded-lg bg-thirdAccent px-3 text-sm font-semibold text-textColor"
        >
          ${show.genres[0] || "No genre"}
        </div>
        <div
          class="flex w-fit items-center gap-1 rounded-lg bg-secondaryAccent px-3 text-sm font-semibold text-textColor"

        >
          ${
            show.rating.average || "Not rated"
          } <i class="fa-solid fa-star text-primaryAccent"></i>
        </div>
        <h3 class="mt-auto font-logo text-lg font-bold text-textColor">
          ${show.name}
        </h3>
      </div>
    </div>
  </a>
    `;
    searchResultsContainer.innerHTML += html;
  }
};
//* Search for the show the user entered
const search = (e) => {
  // If the user presses enter or clicks the search button
  searchResultsContainer.classList.replace("hidden", "grid");
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

//* ------------------ Explore ------------------ *//
const exploreContainer = document.querySelector("#explore_container #shows");
const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3OWUxNjZjMzNhZjE4ZmVlNTgzNWJiMDBiOGE5ZTA1NCIsInN1YiI6IjY0YTJiOTcxMTEzODZjMDBhZGM3OTQxMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.yxORg4upeOsiqCve7e9CDV4i-_Q2LfIpnqKKax3Fnw4",
  },
};
const trending = async () => {
  // Get the trending tv shows
  const res = await fetch(
    "https://api.themoviedb.org/3/trending/tv/day",
    options
  );
  const trending = await res.json();
  // Get the info of each show using the TVmaze API
  const html = await Promise.all(
    trending.results.map(async (trend) => {
      const res = fetch(
        `https://api.tvmaze.com/singlesearch/shows?q=${trend.name}`
      );
      const show = await (await res).json();
      return `
    <a href="show.html?id=${show.id}">
    <div class="w-[210px] h-[270px] peer group relative overflow-hidden">
      <img
        src="${show.image?.medium || "./imgs/placeholder.png"}"
        alt="${show.name}"
        class="w-full h-full object-cover rounded-md shadow-shadow1 mb-2"
      />
      <div
        class="blur-[60px] top-0 absolute -z-10 flex h-full w-full flex-col gap-3 bg-dark p-3 transition-all duration-[.8s] group-hover:z-10 group-hover:bg-dark group-hover:bg-opacity-50 group-hover:blur-0"
      >
        <div
          class="w-fit rounded-lg bg-thirdAccent px-3 text-sm font-semibold text-textColor"
        >
          ${show.genres[0] || "No genre"}
        </div>
        <div
          class="flex w-fit items-center gap-1 rounded-lg bg-secondaryAccent px-3 text-sm font-semibold text-textColor"

        >
          ${
            show.rating.average || "Not rated"
          } <i class="fa-solid fa-star text-primaryAccent"></i>
        </div>
        <h3 class="mt-auto font-logo text-lg font-bold text-textColor">
          ${show.name}
        </h3>
      </div>
    </div>
  </a>
    `;
    })
  );
  exploreContainer.innerHTML = html.join("");
};
trending();

