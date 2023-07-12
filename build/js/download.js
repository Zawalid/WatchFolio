"use strict";
// TODO: Make this script a module

// Shows in the watchList
const watched = window.localStorage.getItem("watched").split(",");
const watching = window.localStorage.getItem("watching").split(",");
const willWatch = window.localStorage.getItem("willWatch").split(",");

// Get the shows from the watchList
const getShows = async (shows) => {
  const showsData = [];
  if (shows[0] === "") return showsData;
  for (let i = 0; i < shows.length; i++) {
    const show = await fetch(`https://api.tvmaze.com/shows/${shows[i]}`);
    const showData = await show.json();
    showsData.push(showData);
  }
  return showsData;
};

//* ------------------------------ Download as PDF ------------------------------ *//
const downloadAsPDF = async () => {
  // Generate the PDF using jsPDF
  const generate = (el) => {
    const doc = new jspdf.jsPDF();
    const elementHTML = el;
    doc.html(elementHTML, {
      callback: function (doc) {
        // Save the PDF
        doc.save("sample-document.pdf");
      },
      x: 15,
      y: 15,
      width: 170, //target width in the PDF document
      windowWidth: 650, //window width in CSS pixels
    });
  };
  // Get the number of rows
  const trNumber = Math.max(
    watchLists.watched.shows.size,
    watchLists.watching.shows.size,
    watchLists.willWatch.shows.size
  );
  // Create the table rows
  const createTr = async () => {
    const tr = [];
    const watchedShows = await getShows(watched);
    const watchingShows = await getShows(watching);
    const willWatchShows = await getShows(willWatch);
    console.log(watchedShows);
    for (let i = 0; i < trNumber; i++) {
      tr.push(`
    <tr>
      ${
        watchedShows[i]
          ? `
          <td class="border-r border-l border-gray-300 p-4">
            <div class="flex flex-col items-center justify-center gap-3 py-5">
              <img
                src="${watchedShows[i].image.medium}"
                alt=""
                class="w-[100px] rounded-xl"
              />
              <h3 class="text-center text-lg font-bold text-textColor">
                ${watchedShows[i].name}
              </h3>
            </div>
          </td>
          `
          : "<td></td>"
      }
      ${
        watchingShows[i]
          ? `
          <td class="border-r border-l border-gray-300 p-4">
            <div class="flex flex-col items-center justify-center gap-3 py-5">
              <img
                src="${watchingShows[i].image.medium}"
                alt=""
                class="w-[100px] rounded-xl"
              />
              <h3 class="text-center text-lg font-bold text-textColor">
                ${watchingShows[i].name}
              </h3>
            </div>
          </td>
          `
          : "<td></td>"
      }
      ${
        willWatchShows[i]
          ? `
          <td class="border-r border-l border-gray-300 p-4">
            <div class="flex flex-col items-center justify-center gap-3 py-5">
              <img
                src="${willWatch[i].image.medium}"
                alt=""
                class="w-[100px] rounded-xl"
              />
              <h3 class="text-center text-lg font-bold text-textColor">
                ${willWatch[i].name}
              </h3>
            </div>
          </td>
          `
          : "<td></td>"
      }
    </tr>
  `);
    }
    return tr.join("");
  };
  // Create the table
  const table = `
  <table class="w-full table-fixed border border-gray-300">
    <thead>
      <tr>
        <th class="border border-gray-300 p-5 pb-8 text-2xl text-textColor2">
          Watched
        </th>
        <th class="border border-gray-300 p-5 pb-8 text-2xl text-textColor2">
          Watching
        </th>
        <th class="border border-gray-300 p-5 pb-8 text-2xl text-textColor2">
          Will Watch
        </th>
      </tr>
    </thead>
    <tbody>
      ${await createTr()}
    </tbody>
  </table>
  `;
  // Create the table element and set the table as its innerHTML
  const el = document.createElement("table");
  el.innerHTML = table;
  el.className = "bg-gradient w-full";
  document.body.appendChild(el);
  // Generate the PDF
  generate(el);
  // Remove the table element
  el.remove();
};

//* ------------------------------ Download as JSON ------------------------------ *//
const downloadAsJSON = async () => {
  // Create the JSON file
  const createJSON = async () => {
    const json = {
      watched: await getShows(watched),
      watching: await getShows(watching),
      willWatch: await getShows(willWatch),
    };
    return json;
  };
  // Create the JSON file
  const json = await createJSON();
  // Create the blob
  const blob = new Blob([JSON.stringify(json)], {
    type: "application/json",
  });
  // Create the URL
  const url = URL.createObjectURL(blob);
  // Create the link
  const a = document.createElement("a");
  a.href = url;
  a.download = "watchList.json";
  // Click on the link
  a.click();
  // Remove the link
  a.remove();
};

// export { downloadAsJSON, downloadAsPDF };