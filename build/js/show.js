"use strict";
const container = document.getElementById("overview");
const overview = async () => {
  try {
    const res = await fetch(
      `https://api.tvmaze.com/shows/${window.location.hash.slice(1)}`
    );
    //   Convert the response to json
    const show = await res.json();
    console.log(show);
    //   Set the background image
    document.documentElement.style.setProperty(
      "--bg",
      `url(${show.image.original})`
    );
    // Fix the summary
    show.summary = show.summary.replace(/<p>/g, "");
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

    // Get the stars number based on the rating and create the stars
    let stars = [];
    for (let i = 0; i < 5; i++) {
      const star = document.createElement("i");
      star.classList.add("fa-solid", "fa-star", "text-textColor2");
      stars.push(star);
    }
    const starsNum = (Math.round(show.rating.average) / 10) * 5;
    for (let i = 0; i < starsNum; i++) {
      stars[i].classList.replace("text-textColor2", "text-primaryAccent");
    }

    // Create the info div
    const info = `
  
  <div class="mb-16 mt-9 flex w-full items-center gap-7 max-sm:flex-col">
  <img
    src="${show.image.original || "./imgs/placeholder.png"}"
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
    <div class="flex gap-5">
      ${genres}
    </div>
    <div
      class="flex w-fit items-center gap-5 rounded-lg bg-dark bg-opacity-30 px-3 py-1 text-sm font-semibold text-textColor backdrop-blur-sm"
    >
      <span>${show.rating.average}</span>
      <div class="flex gap-2">
        ${stars.map((star) => star.outerHTML).join("")}
    </div>
    </div>
    <div class="mt-5 flex w-4/6 gap-6 max-sm:w-full max-sm:flex-col">
      <div
        class="w-full cursor-pointer rounded-3xl bg-secondaryAccent px-5 py-3 text-center font-semibold text-textColor transition-colors duration-300 hover:bg-opacity-80"
      >
        I Watched
      </div>
      <div
        class="w-full cursor-pointer rounded-3xl bg-dark px-5 py-3 text-center font-semibold text-textColor transition-colors duration-300 hover:bg-opacity-80"
      >
        I'm Watching
      </div>
      <div
        class="w-full cursor-pointer rounded-3xl bg-thirdAccent px-5 py-3 text-center font-semibold text-textColor transition-colors duration-300 hover:bg-opacity-80"
      >
        I Will Watch
      </div>
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
    container.innerHTML = "";
    container.insertAdjacentHTML("beforeend", info);
    container.insertAdjacentHTML("beforeend", details);
    container.insertAdjacentHTML("beforeend", seasons);
    container.insertAdjacentHTML("beforeend", cast);
  } catch (err) {
    console.log(err);
    container.innerHTML = noResults();
  }
};
const getSeasons = async () => {
  const res = await fetch(
    `https://api.tvmaze.com/shows/${window.location.hash.slice(1)}/seasons`
  );
  //   Convert the response to json
  const seasons = await res.json();

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
      <a href="#" class="flex flex-col items-center gap-3">
      <img
        src="${season.image?.medium || "./imgs/placeholder.png"}"
        alt=""
        class="w-[150px] rounded-lg shadow-shadow1"
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
const getCast = async () => {
  const res = await fetch(
    `https://api.tvmaze.com/shows/${window.location.hash.slice(1)}/cast`
  );
  //   Convert the response to json
  const casts = await res.json();
  //   console.log(casts);
  const html = `
    <div class="mb-8">
    <details open>
        <summary class="mb-5 text-xl font-bold text-thirdAccent">
        Casts
        </summary>
        <div class="flex flex-wrap gap-8 max-sm:justify-center">
        ${casts
          .map((cast) => {
            return `
        <a href="#" class="flex flex-col items-center gap-3">
        <img
            src="${cast.person.image?.medium || "./imgs/placeholder.png"}"
            alt=""
            class="w-[120px] rounded-lg shadow-shadow1"
        />
        <span class="text-lg font-semibold text-textColor">${
          cast.person.name
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
overview();

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

window.addEventListener("hashchange", overview);
