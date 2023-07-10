"use strict";

let showName, currentSeason;
!window.localStorage.key("watched") &&
  ["watched", "watching", "willWatch"].forEach((list) => {
    window.localStorage.setItem(list, "");
  });

//* ------------------ Creating overview containers (Avoid repetition) ------------------ *//
const overviewContainer = `
<div
class="absolute inset-0 -z-10 flex h-full w-full cursor-zoom-out bg-[#0005] opacity-0 backdrop-blur-[2px] transition-opacity duration-500 max-md:h-full md:items-center md:justify-center"
id="overview"
>
<div
  class="relative bg-gradient flex min-h-[500px] max-md:min-h-screen w-4/5 cursor-auto flex-col gap-10 rounded-xl  p-8 shadow-shadow1 max-md:left-0 max-md:h-full max-md:w-full max-md:translate-x-0 max-md:overflow-y-scroll max-md:pb-[75px] max-md:pt-14 max-sm:rounded-none"
></div>
</div>
`;
for (let i = 0; i < 3; i++) {
  document.body.insertAdjacentHTML("beforeend", overviewContainer);
}

document.querySelectorAll("#overview")[1].id = "season_overview";
document.querySelectorAll("#overview")[1].id = "person_overview";
document.querySelectorAll("#overview")[1].firstElementChild.className =
  "relative flex min-h-[500px] w-4/5 cursor-auto flex-col gap-10 rounded-xl bg-gradient  bg-cover bg-center shadow-shadow1 max-md:left-0 max-md:h-full max-md:min-h-screen max-md:w-full max-md:translate-x-0 max-md:overflow-y-auto max-sm:rounded-none overflow-hidden";
document.querySelectorAll("#overview")[1].id = "episode_overview";

// todo : add the lottie loading animation here and the container in the html when you finish (I hate live server)
//* ------------------------------ Loading Animation ------------------------------ *//
// const animation = lottie.loadAnimation({
//   container: document.getElementById("animation-container"),
//   renderer: "svg",
//   path: "js/loading.json",
//   autoplay: true,
//   loop: true,
// });

//* ------------------------------ Helpers Functions ------------------------------ *//
//* Get the stars number based on the rating and create the stars
const getStars = (rating) => {
  let stars = [];
  for (let i = 0; i < 5; i++) {
    const star = document.createElement("i");
    star.classList.add("fa-solid", "fa-star", "text-textColor2");
    stars.push(star);
  }
  const starsNum = (Math.round(rating) / 10) * 5;
  for (let i = 0; i < starsNum; i++) {
    stars[i].classList.replace("text-textColor2", "text-primaryAccent");
  }
  return stars;
};
//* Show the loading spinner and the container
const showLoading = (container) => {
  container.classList.add("show");
  container.firstElementChild.scrollIntoView({ behavior: "smooth" });
  container.firstElementChild.innerHTML = `
  <i
  class="fa-solid fa-spinner absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-4xl text-thirdAccent"
></i>
  `;
  // animation.setSpeed(0.7);
};
//* Display the overview container
const displayOverview = (container, html, img = null) => {
  setTimeout(() => {
    container.firstElementChild.innerHTML = html;
    if (container === episodeOverviewContainer) {
      document.documentElement.style.setProperty("--episode-bg", `url(${img})`);
    }
  }, 1000);
  if (window.matchMedia("(max-width: 768px)").matches) {
    window.scrollTo(0, 0);
    document.body.classList.add("h-screen", "overflow-hidden");
  }
};
//* Close the overview container
const closeOverview = (container) => {
  container.addEventListener("click", (e) => {
    if (e.target.closest("#close") || e.target === e.currentTarget) {
      container !== episodeOverviewContainer &&
        document.body.classList.remove("h-screen", "overflow-hidden");
      container.classList.remove("show");
      container.firstElementChild.innerHTML = "";
      if (container === episodeOverviewContainer) {
        document.documentElement.style.setProperty(
          "--episode-bg",
          "linear-gradient(306deg, #000 0%, #0b1531 100%)"
        );
      }
    }
  });
};

//* ------------------------------ The show overview ------------------------------ *//
const showOverviewContainer = document.getElementById("overview");
const showOverview = async () => {
  try {
    const res = await fetch(
      `https://api.tvmaze.com/shows/${window.location.search.split("?")[1]}`
    );
    //   Convert the response to json
    const show = await res.json();
    //   Set the background image
    document.documentElement.style.setProperty(
      "--bg",
      `url(${show.image.original})`
    );
    showName = show.name;
    // Set the title
    document.title = show.name;
    // Fix the summary
    show.summary = show.summary?.replace(/<p>|<\/p>/g, "");
    // Get the genres
    const genres = show.genres
      .map((genre) => {
        return `
    <div
    class="w-fit rounded-lg bg-thirdAccent px-3 text-sm font-semibold text-textColor"
  >
    ${genre}
  </div>
    `;
      })
      .join("");

    // Create the info div
    const info = `
  
  <div class="mb-16 mt-9 flex w-full items-center gap-7 max-sm:flex-col">
  <img
    src="${show.image?.original || "./imgs/placeholder.png"}"
    alt=""
    class="w-[300px] rounded-lg shadow-shadow1 max-sm:w-[230px]"
  />
  <div class="flex flex-1 flex-col gap-6 max-sm:items-center">
    <h1
      class="font-logo text-4xl font-extrabold text-primaryAccent max-sm:text-3xl"
    >
      ${show.name}
      <span class="ms-2 font-mono text-lg font-semibold text-textColor"
        >(${show.premiered.split("-")[0]})</span
      >
    </h1>
    <div class="flex gap-5 flex-wrap max-sm:justify-center">
      ${genres}
    </div>
    <div
      class="flex w-fit items-center gap-5 rounded-lg bg-dark bg-opacity-30 px-3 py-1 text-sm font-semibold text-textColor backdrop-blur-sm"
    >
      <span>${show.rating.average}</span>
      <div class="flex gap-2">
        ${getStars(Math.round(show.rating.average))
          .map((star) => star.outerHTML)
          .join("")}
    </div>
    </div>
    <div class="mt-5  gap-6 w-3/4 max-sm:w-full  grid grid-cols-[repeat(auto-fit,minmax(152px,1fr))]">
      <button
        class=" cursor-pointer rounded-3xl bg-secondaryAccent px-5 py-3 text-center font-semibold text-textColor transition-colors duration-300 hover:bg-opacity-80" data-list="watched"
      >
        I Watched
      </button>
      <button
        class=" cursor-pointer rounded-3xl bg-dark px-5 py-3 text-center font-semibold text-textColor transition-colors duration-300 hover:bg-opacity-80" data-list="watching"
      >
        I'm Watching
      </button>
      <button
        class="max-wrap:col-span-full cursor-pointer rounded-3xl bg-thirdAccent px-5 py-3 text-center font-semibold text-textColor transition-colors duration-300 hover:bg-opacity-80" data-list="willWatch"
      >
        I Will Watch
      </button>
    </div>
  </div>
</div>
  `;
    // Create the details div
    const details = `
  <div
  class="my-7 flex w-full items-start justify-between max-sm:flex-col max-sm:gap-10"
>
  <div class="w-[40%] max-sm:w-full">
    <details open>
      <summary class="mb-5 text-xl font-bold text-thirdAccent">
        Storyline
      </summary>
      <p class="text-lg font-semibold leading-snug text-textColor2">
       ${show.summary}
      </p>
    </details>
  </div>
  <div class="w-[40%] max-sm:w-full">
    <details open>
      <summary class="mb-5 text-xl font-bold text-thirdAccent">
        Details
      </summary>
      <div class="flex items-center gap-4 text-lg">
        <span class="font-semibold text-textColor2">Id :</span>
        <span class="text-textColor">${show.id}</span>
      </div>
      <div class="mt-3 flex items-center gap-4 text-lg">
        <span class="font-semibold text-textColor2">Country :</span>
        <span class="text-textColor">${
          show.network?.country?.name || "Unknown"
        }</span>
      </div>
      <div class="mt-3 flex items-center gap-4 text-lg">
        <span class="font-semibold text-textColor2">Language :</span>
        <span class="text-textColor">${show.language}</span>
      </div>
      <div class="mt-3 flex items-center gap-4 text-lg">
        <span class="font-semibold text-textColor2">Release Date :</span>
        <span class="text-textColor">${show.premiered}</span>
      </div>
      <div class="mt-3 flex items-center gap-4 text-lg">
        <span class="font-semibold text-textColor2">Status :</span>
        <span class="text-textColor">${show.status}</span>
      </div>
      <div class="mt-3 flex items-center gap-4 text-lg">
        <span class="font-semibold text-textColor2">Network :</span>
        <span class="text-textColor capitalize">${
          show.network?.name || show.officialSite?.split(".")[1] || "Unknown"
        }</span>
      </div>
    </details>
  </div>
</div>
  `;
    //   Create the seasons div
    const seasons = await getSeasons();
    //   Create the cast div
    const cast = await getCast();
    //   Insert the elements
    showOverviewContainer.innerHTML = "";
    showOverviewContainer.insertAdjacentHTML("beforeend", info);
    showOverviewContainer.insertAdjacentHTML("beforeend", details);
    showOverviewContainer.insertAdjacentHTML("beforeend", seasons);
    showOverviewContainer.insertAdjacentHTML("beforeend", cast);
  } catch (err) {
    console.log(err);
    // showOverviewContainer.innerHTML = noResults();
    return;
  }
};
//* Get the seasons
const getSeasons = async () => {
  const res = await fetch(
    `https://api.tvmaze.com/shows/${
      window.location.search.split("?")[1]
    }/seasons`
  );
  //   Convert the response to json
  const seasons = await res.json();
  // Remove seasons with premiereDate null
  seasons.forEach((season, i) => {
    if (!season.premiereDate) {
      seasons.splice(i, 1);
    }
  });
  const html = `
  <div class="mb-8">
  <details open>
    <summary class="mb-5 text-xl font-bold text-thirdAccent">
      Seasons
    </summary>
    <div class="flex flex-wrap gap-8 max-sm:justify-center">
      ${seasons
        .map((season) => {
          return `
      <a href="#${
        season.id
      }" class="flex flex-col items-center gap-3"  id="season">
      <img
        src="${season.image?.medium || "./imgs/placeholder.png"}"
        alt=""
        class="w-[150px] rounded-lg transition-all duration-500 hover:shadow-[-19px_15px_20px_#000] shadow-shadow1 flex-1"
      />
      <span class="text-lg font-semibold text-textColor">Season ${
        season.number
      }</span>
    </a>
    `;
        })
        .join("")}
    </div>
  </details>
</div>
  `;
  return html;
};
//* Get the cast
const getCast = async () => {
  const res = await fetch(
    `https://api.tvmaze.com/shows/${window.location.search.split("?")[1]}/cast`
  );

  const renderPerson = (name, character, image) => {
    return `
    <div class="flex flex-col  gap-3 cursor-pointer" data-character="${character}" data-name="${name}" id="person">
    <img
    src="${image || "./imgs/placeholder.png"}"
    alt=""
    class="w-[120px] rounded-lg shadow-shadow1 transition-all duration-300 hover:grayscale"
    />
    <span class="text-lg font-semibold text-textColor">${name}</span></div>`;
  };
  const showAllCast = () => {
    return `
    ${casts
      .map((cast) => {
        return `
        ${renderPerson(
          cast.person.name,
          cast.character.name,
          cast.person.image?.medium
        )}
        `;
      })
      .join("")}
      <a class="flex flex-col items-center justify-center text-thirdAccent text-lg font-bold h-fit m-auto cursor-pointer" id="showLess">Show Less</a>
      `;
  };
  const showLessCast = () => {
    return `
    ${casts
      .slice(0, 15)
      .map((cast) => {
        return `
        ${renderPerson(
          cast.person.name,
          cast.character.name,
          cast.person.image?.medium
        )}
        `;
      })
      .join("")}
      ${
        casts.length > 15
          ? `<a class="flex flex-col items-center justify-center text-thirdAccent text-lg font-bold h-fit m-auto cursor-pointer" id="showMore">Show More</a>`
          : ""
      }
      `;
  };
  //   Convert the response to json
  const casts = await res.json();
  const html = `
    <div class="mb-8">
    <details open>
        <summary class="mb-5 text-xl font-bold text-thirdAccent">
        Cast
        </summary>
        <div class="grid grid-cols-[repeat(auto-fit,110px)] text-center gap-8 max-sm:justify-center ${
          casts.length === 0 ? "font-bold text-lg text-textColor2" : ""
        }" id="cast">
        ${casts.length !== 0 ? showLessCast() : "No cast available"}
        </div>
    </details>
    </div>
    `;
  document.addEventListener("click", (e) => {
    if (e.target.closest("#showMore")) {
      document.getElementById("cast").innerHTML = showAllCast();
    }
    if (e.target.closest("#showLess")) {
      document.getElementById("cast").innerHTML = showLessCast();
    }
  });

  return html;
};
//* No results message
const noResults = () => {
  document.documentElement.style.setProperty("--bg", `url(../imgs/bg.jpg)`);

  return `
    <div
    class="absolute left-1/2 top-1/2 w-2/3 -translate-x-1/2 -translate-y-1/2 px-4 max-sm:w-full"
  >
    <img
      src="imgs/no result search icon.png"
      alt=""
      class="mx-auto w-[400px]"
    />
    <h1
      class="text-center text-xl font-bold leading-relaxed text-textColor2"
    >
      Oops! The TV show ID you entered is incorrect or doesn't exist.
      Please double-check the ID and try again.
      <spam class="text-primaryAccent">Thank you!</spam>
    </h1>
  </div>
    `;
};
//* Initialize
showOverview();
//* To make sure that the show overview works also when the id is set manually
window.addEventListener("hashchange", showOverview);

//* ------------------------------ Season overview ------------------------------ *//
const seasonOverviewContainer = document.getElementById("season_overview");
const seasonOverview = async (id) => {
  showLoading(seasonOverviewContainer);
  // I used the try and catch to display an error message when the requests takes too long
  const res = await fetch(`https://api.tvmaze.com/seasons/${id}`);
  //   Convert the response to json
  const season = await res.json();
  // const season = seasons.find((e) => e.id === +id);
  currentSeason = season.number;
  // Fix the summary
  season.summary = season.summary?.replace(/<p>/g, "");
  const html = `
  <i
    class="fa-solid fa-xmark text-textColor2 absolute right-4 top-4 cursor-pointer text-2xl"
    id="close"
  ></i>
  <div class="flex w-full items-start gap-7 max-sm:flex-col">
    <img
      src="${season.image?.original || "./imgs/placeholder.png"} "
      alt=""
      class="w-[230px] rounded-lg shadow-shadow1 max-sm:self-center"
    />
    <div class="flex flex-1 flex-col gap-6 ">
      <h1
        class="font-logo text-4xl font-extrabold text-primaryAccent max-sm:text-3xl max-md:text-center"
      >
        Season ${season?.number}
        <span class="ms-2 font-mono text-lg font-semibold text-textColor"
          >(${season.premiereDate?.split("-")[0] || ""})</span
        >
      </h1>
      <div class="">
        <details open>
          <summary class="mb-5 text-xl font-bold text-thirdAccent">
            Details
          </summary>
          <div class="mt-3 flex items-center gap-4 text-lg">
            <span class="font-semibold text-textColor2">Episodes :</span>
            <span class="text-textColor">${
              season?.episodeOrder || "Unconfirmed"
            }</span>
          </div>
          <div class="mt-3 flex items-center gap-4 text-lg">
            <span class="font-semibold text-textColor2"
              >Release Date :</span
            >
            <span class="text-textColor">${
              season?.premiereDate || "Unconfirmed"
            }</span>
          </div>
          <div class="mt-3 flex items-center gap-4 text-lg">
            <span class="font-semibold text-textColor2">End Date :</span>
            <span class="text-textColor">${season?.endDate}</span>
          </div>
        </details>
      </div>
      <div class="">
        <details open>
          <summary class="mb-5 text-xl font-bold text-thirdAccent">
            Summary
          </summary>
          <p class="text-lg font-semibold leading-snug text-textColor2">
           ${season.summary || "No summary available"}
          </p>
        </details>
      </div>
    </div>
  </div>
  <div>
    <details open>
      <summary class="mb-5 text-xl font-bold text-thirdAccent">
        Episodes
      </summary>
      <div class="my-7 flex flex-col md:h-[300px] md:overflow-y-scroll  gap-3 max-md:pb-7">
      ${await getEpisodes()}
      </div>
    </details>
  </div>
  `;
  displayOverview(seasonOverviewContainer, html);
};
//* Get the episodes
const getEpisodes = async () => {
  const res = await fetch(
    `https://api.tvmaze.com/seasons/${window.location.hash.slice(1)}/episodes`
  );
  //   Convert the response to json
  let episodes = await res.json();
  // Remove episodes with number null
  episodes = episodes.filter((episode) => episode.number);
  const html = episodes
    .map((episode) => {
      return `
      <div
  " 
  class="flex items-center gap-3 cursor-pointer" id="episode" data-info="${
    episode.name
  }|${episode.number}|${episode.rating.average}">
        <h2 class="text-2xl font-bold text-center text-textColor2 w-7">${
          episode.number || "Special"
        }</h2>
        <img src="${
          episode.image?.original || "./imgs/placeholder.png"
        }" alt="" class="w-[150px] aspect-[3/2] object-cover rounded-xl max-sm:w-[100px]" />
        <div class="flex flex-1 flex-col gap-2">
          <h3 class="text-lg font-bold text-textColor h-7 overflow-y-auto">
           ${episode.name}
          </h3>
          <div
            class="flex w-fit items-center gap-1 text-sm font-semibold text-textColor2"
          >
            ${episode.rating?.average || "Unrated"}
            <div class="flex gap-2">
            ${getStars(Math.round(episode.rating.average))
              .map((star) => star.outerHTML)
              .join("")}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-clock text-textColor2"></i>
            <span class="font-semibold text-textColor">${
              episode.runtime
            }min</span>
          </div>
        </div>
      </div>
  `;
    })
    .join("");
  return html;
};
//* Show the season overview when clicking on the season
document.addEventListener("click", (e) => {
  if (e.target.closest("#season")) {
    seasonOverview(e.target.closest("#season").hash.slice(1));
  }
});
//* Close the season overview when clicking on the close button or the container
closeOverview(seasonOverviewContainer);

//* ------------------------------ The TMDB API ------------------------------ *//
const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3OWUxNjZjMzNhZjE4ZmVlNTgzNWJiMDBiOGE5ZTA1NCIsInN1YiI6IjY0YTJiOTcxMTEzODZjMDBhZGM3OTQxMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.yxORg4upeOsiqCve7e9CDV4i-_Q2LfIpnqKKax3Fnw4",
  },
};
const baseUrl = "http://image.tmdb.org/t/p/";
const genders = {
  0: "Not Specified",
  1: "Female",
  2: "Male",
  3: "Non Binary",
};

//* ------------------------------ Person overview ------------------------------ *//
const personOverviewContainer = document.getElementById("person_overview");
const personOverview = async (name, character) => {
  showLoading(personOverviewContainer);
  // Get the person id
  const personId = await getPersonId(name);
  const res = await fetch(
    `https://api.themoviedb.org/3/person/${personId}`,
    options
  );
  const person = await res.json();
  console.log(person);
  const age =
    new Date().getFullYear() - new Date(person.birthday).getFullYear();
  const html = `

  <i
    class="fa-solid fa-xmark absolute right-4 top-4 cursor-pointer text-2xl text-textColor2"
    id="close"
  ></i>
  <div class="flex w-full items-start gap-7 max-sm:flex-col">
    <img src="${
      baseUrl + "original" + person.profile_path || "./imgs/placeholder.png"
    } "
    alt="" class="w-[230px] rounded-lg shadow-shadow1 max-sm:self-center"
    />
    <div class="flex flex-1 flex-col gap-6">
      <h1
        class="font-logo text-4xl font-extrabold text-primaryAccent max-sm:text-3xl max-md:text-center"
      >
        ${person.name}
        <span class="ms-2 font-mono text-lg font-semibold text-textColor max-md:block"
          >(${character})</span
        >
      </h1>
      <div class="">
        <details open>
          <summary class="mb-5 text-xl font-bold text-thirdAccent">
            Personal Info
          </summary>
          <div class="mt-3 flex items-center gap-4 text-lg">
            <span class="font-semibold text-textColor2">Age :</span>
            <span class="text-textColor"
              >${age}</span
            >
          </div>
          <div class="mt-3 flex items-center gap-4 text-lg">
            <span class="font-semibold text-textColor2"
              >Gender :</span
            >
            <span class="text-textColor">${genders[person.gender]}</span>
          </div>
          <div class="mt-3 flex items-center gap-4 text-lg">
            <span class="font-semibold text-textColor2">Birthday :</span>
            <span class="text-textColor">${person.birthday}</span>
          </div>
          <div class="mt-3 flex items-center gap-4 text-lg">
            <span class="font-semibold text-textColor2">Place of birth :</span>
            <span class="text-textColor">${person.place_of_birth}</span>
          </div>
        </details>
      </div>
      <div class="">
        <details>
          <summary class="mb-5 text-xl font-bold text-thirdAccent">
            Biography
          </summary>
          <p class="text-lg font-semibold leading-snug text-textColor2">
            ${person.biography || "No biography available"}
          </p>
        </details>
      </div>
    </div>
  </div>
  <div>
    <details open>
      <summary class="mb-5 text-xl font-bold text-thirdAccent">
        Other TV Shows
      </summary>
      <div
        class="my-7 flex gap-3 overflow-x-auto max-md:pb-7"
      >
        ${await getOtherShows(personId)}
      </div>
    </details>
  </div>
`;
  displayOverview(personOverviewContainer, html);
};
//* Get the person id
const getPersonId = async (name) => {
  const res = await fetch(
    `https://api.themoviedb.org/3/search/person?query=${name}&page=1`,
    options
  );
  const person = await res.json();
  return person.results[0].id;
};
//* Get the other shows
const getOtherShows = async (id) => {
  const res = await fetch(
    `https://api.themoviedb.org/3/person/${id}/tv_credits`,
    options
  );
  let shows = await res.json();
  const infos = await Promise.all(
    shows.cast.map((show) => {
      return getOtherShowInfo(show.name);
    })
  );
  shows.cast.forEach((show, i) => {
    show.info = infos[i];
  });
  // Remove duplicates
  shows.cast = shows.cast = shows.cast.filter(
    (show, i, arr) =>
      show.info && arr.findIndex((t) => t.info?.id === show.info?.id) === i
  );

  const html = shows.cast
    .map((show) => {
      if (!show.info) return "";
      return `
      <a href="show.html?${show?.info?.id}">
      <div class=" h-[270px] w-16 hover:w-48 transition-all duration-500 peer group relative overflow-hidden">
        <img
          src="${
            show.poster_path
              ? baseUrl + "original" + show.poster_path
              : "./imgs/placeholder.png"
          }"
          alt=""
          class="w-full h-full object-cover rounded-md shadow-shadow1 mb-2"
        />
        ${show?.info?.info}
        </div>
        </a>
    `;
    })
    .join("");

  return html;
};
//* Get the show info using the first API
const getOtherShowInfo = async (name) => {
  try {
    const res = await fetch(
      `https://api.tvmaze.com/singlesearch/shows?q=${name}`
    );
    const show = await res.json();
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
    return {
      info,
      id: show.id,
    };
  } catch (err) {}
};
//* Show the person overview when clicking on the person
document.addEventListener("click", (e) => {
  if (e.target.closest("#person")) {
    personOverview(
      e.target.closest("#person").dataset.name,
      e.target.closest("#person").dataset.character
    );
  }
});
//* Close the person overview when clicking on the close button or the container
closeOverview(personOverviewContainer);

//* ------------------------------ Episode overview ------------------------------ *//
const episodeOverviewContainer = document.getElementById("episode_overview");
const episodeOverview = async (showName, season, otherInfo) => {
  showLoading(episodeOverviewContainer);
  const showId = await getShowId(showName);
  const res = await fetch(
    `https://api.themoviedb.org/3/tv/${showId}/season/${season}/episode/${otherInfo.episodeNumber}`,
    options
  );
  const episode = await res.json();
  const homePage = await getShowHomePage(showName);
  const episodePoster =
    `${baseUrl}original${episode.still_path}` || "../imgs/placeholder.png";
  const html = `
<i
          class="fa-solid fa-xmark absolute right-4 top-4 cursor-pointer text-2xl z-10 text-textColor2"
          id="close"
        ></i>
        <div
          class="flex w-full flex-1 flex-col gap-7 bg-black bg-opacity-50 p-8 max-md:pb-[75px] max-md:pt-14 max-sm:flex-col"
        >
          <h1 class="text-4xl font-bold text-textColor">
            ${showName} season ${season} episode ${otherInfo.episodeNumber} :
          </h1>
          <div
            class="flex w-full flex-1 flex-col items-start justify-center gap-5"
          >
            <div class="flex gap-2 text-lg font-bold text-textColor2">
              Name :
              <h2 class="text-lg font-semibold text-textColor">
                ${otherInfo.episodeName || episode.name}
              </h2>
            </div>
            <div class="flex gap-2 text-lg font-bold text-textColor2">
              Rating :
              <div
                class="flex w-fit items-center gap-5 rounded-lg bg-dark bg-opacity-30 px-3 py-1 text-sm font-semibold text-textColor backdrop-blur-sm"
              >
                <span>${otherInfo.episodeRating}</span>
                <div class="flex gap-2">
                  ${getStars(otherInfo.episodeRating)
                    .map((star) => star.outerHTML)
                    .join("")}
                </div>
              </div>
            </div>
            <div class="flex gap-2 text-lg font-bold text-textColor2">
              Runtime :
              <div class="flex items-center gap-2 text-textColor">
                <i class="fa-solid fa-clock"></i>
                <span class="font-semibold">60min</span>
              </div>
            </div>
            <p class="text-lg font-bold leading-snug text-textColor">
              <span class="text-textColor2">Overview :</span>
              ${episode.overview || "No overview available"}
            </p>

            <a
              href="${homePage || "#"}}"
              class="mt-5 cursor-pointer rounded-3xl bg-secondaryAccent px-7 py-3 text-center font-bold text-textColor transition-colors duration-300 hover:bg-opacity-80"
            >
              Watch Now
            </a>
          </div>
        </div>
`;
  displayOverview(episodeOverviewContainer, html, episodePoster);
};
//* Get the show id
const getShowId = async (showName) => {
  const res = await fetch(
    `https://api.themoviedb.org/3/search/tv?query=${showName}`,
    options
  );
  const data = await res.json();
  return data.results[0].id;
};
//* Get the show official homepage
const getShowHomePage = async (showName) => {
  const res = await fetch(
    `https://api.themoviedb.org/3/tv/${await getShowId(showName)}`,
    options
  );
  const data = await res.json();
  return data.homepage;
};
//* Show the episode overview when clicking on the episode
document.addEventListener("click", (e) => {
  if (e.target.closest("#episode")) {
    let info = e.target.closest("#episode").dataset.info;
    info = {
      episodeName: info.split("|")[0],
      episodeNumber: info.split("|")[1],
      episodeRating: info.split("|")[2],
    };
    episodeOverview(showName, currentSeason, info);
  }
});
//* Close the episode overview when clicking on the close button or the container
closeOverview(episodeOverviewContainer);

//* ------------------------------ WatchLists ------------------------------ *//
const watchListContainer = document.getElementById("watchList");
document.querySelectorAll("#watchList_toggler").forEach((toggler) => {
  toggler.addEventListener("click", function () {
    // Initialization
    showsFromWatchList(watchLists.watched.name);
    watchListContainer.classList.toggle("show");
    !watchListContainer.classList.contains("show") &&
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
//* Perform the right action when clicking  on a watchList button
showOverviewContainer.addEventListener("click", (e) => {
  const id = window.location.search.split("?")[1];
  const toggleIdToWatchList = (list) => {
    // Check if the show already added and remove it if so  else add it
    if (list.shows.has(id)) {
      removeFromWatchList(id, list);
      // Restore the text content to the default
      e.target.innerHTML = list.defaultButton;
    } else {
      addToWatchList(id, list.shows);
      // Set the text content to the active
      e.target.innerHTML = list.activeButton;
    }
  };
  if (e.target.tagName === "BUTTON" && e.target.dataset.list === "watched") {
    toggleIdToWatchList(watchLists.watched);
  } else if (
    e.target.tagName === "BUTTON" &&
    e.target.dataset.list === "watching"
  ) {
    toggleIdToWatchList(watchLists.watching);
  } else if (
    e.target.tagName === "BUTTON" &&
    e.target.dataset.list === "willWatch"
  ) {
    toggleIdToWatchList(watchLists.willWatch);
  }
});
//* Display shows from the chosen list
const showsFromWatchList = async (list) => {
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
  <i class="fa-solid fa-trash text-textColor2 transition-colors hover:text-secondaryAccent duration-300 text-lg cursor-pointer" id="remove"></i>
  </div>
  `;
  };
  const emptyList = `
  <div class="flex flex-col items-center h-full justify-center ">
  <img src="" alt="" class="">
  <h2 class="font-bold text-textColor2">List is empty</div>
  </div>
  `;

  let html =
    showsIds.size > 0
      ? await Promise.all([...showsIds].map((id) => displayShow(id)))
      : emptyList;

  watchListContainer.lastElementChild.innerHTML = html;
};

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
    showsFromWatchList(watchLists[this.dataset.list].name);
  });
});
