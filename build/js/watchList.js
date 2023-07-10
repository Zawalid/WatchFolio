"use strict";
// TODO: Make this script a module
//* ------------------------------ WatchLists ------------------------------ *//
const watchListContainer = document.getElementById("watchList");
document.querySelectorAll("#watchList_toggler").forEach((toggler) => {
  toggler.addEventListener("click", function () {
    showsFromWatchList(watchLists.watched.name);
    watchListContainer.classList.toggle("show");

    !watchListContainer.classList.contains("show") &&
      window.location.pathname.includes("show.html") &&
      document.body.classList.remove("h-screen", "overflow-hidden");

    this.firstElementChild.classList.toggle("active");
    if (window.matchMedia("(max-width: 768px)").matches) {
      window.scrollTo(0, 0);
      watchListContainer.classList.contains("show") &&
        document.body.classList.add("h-screen", "overflow-hidden");
    }
  });
});
document.addEventListener("click", (e) => {
  if (
    !watchListContainer.contains(e.target) &&
    !e.target.closest("#watchList_toggler")
  ) {
    watchListContainer.classList.remove("show");
    document
      .querySelectorAll("#watchList_toggler")
      .forEach((toggler) =>
        toggler.firstElementChild.classList.remove("active")
      );
    window.location.pathname.includes("show.html") &&
      document.body.classList.remove("h-screen", "overflow-hidden");
  }
});
//* Data related to the watchList
const watchLists = {
  watched: {
    name: "watched",
    defaultButton: "I Watched",
    activeButton: `<i class="fa-solid fa-check"></i> Watched`,
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
    activeButton: `<i class="fa-solid fa-check"></i> Will Watch`,
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
  // Add the id to the chosen list
  list.shows.delete(id);
  // Update the list in the local storage
  window.localStorage.setItem(list.name, [...list.shows]);
};

//* Display shows from the chosen list
const showsFromWatchList = async (list) => {
  watchListContainer
    .querySelectorAll("button")
    .forEach((button) => button.classList.remove("active"));
  watchListContainer
    .querySelector(`button[data-list='${list}'`)
    .classList.add("active");
  const showsIds = watchLists[list].shows;
  const getShow = async (id) => {
    const res = await fetch(`https://api.tvmaze.com/shows/${id}`);
    const show = await res.json();
    return show;
  };
  const displayShow = async (id) => {
    const show = await getShow(id);
    return `
    <div class="flex items-center justify-between" >
  <a href="show.html?${show.id}" class="flex items-center gap-3 " >
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
      ? await Promise.all([...showsIds].map((id) => displayShow(id)))
      : emptyList;

  watchListContainer.lastElementChild.innerHTML = html;
};
// Delete
document.addEventListener("click", (e) => {
  if (e.target.closest("#removeFromList")) {
    const id = e.target
      .closest("#removeFromList")
      .previousElementSibling.href.split("?")[1];
    const list = watchListContainer.dataset.current_list;
    window.location.pathname.includes("show.html") &&
      document
        .getElementById("overview")
        .querySelectorAll("button")
        .forEach((button) => {
          if (button.dataset.list == list) {
            button.innerHTML = watchLists[list].defaultButton;
          }
        });
    removeFromWatchList(id, watchLists[list]);
    showsFromWatchList(list);
  }
});
//* Retrieve shows from local storage and store them back in the lists
const retrieveAndStoreLists = (list, listName) => {
  const lists = window.localStorage.getItem(listName)?.split(",");
  lists[0] == "" && lists.splice(0, 1);
  list.shows = new Set(lists);
};
retrieveAndStoreLists(watchLists.watched, "watched");
retrieveAndStoreLists(watchLists.watching, "watching");
retrieveAndStoreLists(watchLists.willWatch, "willWatch");

watchListContainer.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", function () {
    watchListContainer
      .querySelectorAll("button")
      .forEach((button) => button.classList.remove("active"));
    this.classList.add("active");
    watchListContainer.dataset.current_list = this.dataset.list;
    showsFromWatchList(watchLists[this.dataset.list].name);
  });
});
