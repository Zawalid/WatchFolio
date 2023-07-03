"use strict";

//! Search functionality
const container = document.getElementById("search_results");
const searchInput = document.getElementById("search_input");
const searchBtn = document.getElementById("search_button");

const displayResults = async (query) => {
  // Show the loading spinner
  container.innerHTML = `
    <i
    class="fa-solid fa-spinner absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-4xl text-thirdAccent"
  ></i>
    `;
  // Fetch the data
  const res = await fetch(` https://api.tvmaze.com/search/shows?q=${query}`);
  //   Convert the response to json
  const data = await res.json();
  console.log(data);
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
    container.innerHTML = noResults;
    return;
  }
  // Clear the container
  container.innerHTML = "";
  // Loop through the data array and create the each show element
  for (const obj of data) {
    // Get the show object from the data array
    const { show } = obj;
    // Create the elements
    const image = document.createElement("img");
    const div = document.createElement("div");
    const a = document.createElement("a");
    // Create the info div
    const info = `
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
`;
    // Set the attributes
    image.src = show.image?.medium || "./imgs/placeholder.png";
    image.alt = show.name;
    image.className =
      "w-full h-full object-cover rounded-md shadow-shadow1 mb-2";
    div.className = "w-[210px] h-[270px] peer group relative overflow-hidden";
    a.href = `show.html#${show.id}`;
    // Append the elements to the div and anchor
    div.append(image);
    div.insertAdjacentHTML("beforeend", info);
    a.append(div);
    // Append the anchor to the container
    container.append(a);
  }
};
//* Search function
const search = (e) => {
  // If the user presses enter or clicks the search button
  container.classList.replace("hidden", "grid");
  // Scroll to the container
  container.scrollIntoView({ behavior: "smooth" });
  // Display the data
  displayResults(searchInput.value);
};
//* If the search input is empty
const nothingToSearch = () => {
  if (searchInput.value === "") {
    container.classList.replace("grid", "hidden");
    container.innerHTML = "";
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
