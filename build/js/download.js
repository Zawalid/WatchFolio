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

// Get the shows
// Until i make the script a module, i will use top level await and make them global variables
// const watchedShows = await getShows(watched);
// const watchingShows = await getShows(watching);
// const willWatchShows = await getShows(willWatch);

//* ------------------------------ Download as PDF ------------------------------ *//
const downloadAsPDF = async (toDownload) => {
  // Generate the PDF using jsPDF
  const generatePDF = (el) => {
    const doc = new jspdf.jsPDF();
    const elementHTML = el;
    doc.html(elementHTML, {
      callback: function (doc) {
        // Save the PDF
        doc.save("watchList.pdf");
      },
      x: 15,
      y: 15,
      width: 170, //target width in the PDF document
      windowWidth: 650, //window width in CSS pixels
    });
  };
  // Get the number of rows
  const trNumber = Math.max(watched.length, watching.length, willWatch.length);
  // Create the table rows
  const createTr = async () => {
    const watchedShows = await getShows(watched);
    const watchingShows = await getShows(watching);
    const willWatchShows = await getShows(willWatch);
    const tr = [];
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
  <table >
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
  el.className = "bg-gradient  w-full table-fixed border border-gray-300";
  document.body.appendChild(el);
  // Generate the PDF
  generatePDF(el);
  // Remove the table element
  el.remove();
};

//* ------------------------------ Download as JSON ------------------------------ *//
const downloadAsJSON = async (toDownload) => {
  const watchedShows = await getShows(watched);
  const watchingShows = await getShows(watching);
  const willWatchShows = await getShows(willWatch);
  // Create the JSON file
  async function createJSON() {
    // Check if the user wants to download all the watchList or just one of the lists
    const json =
      toDownload === "all"
        ? {
            watched: watchedShows,
            watching: watchingShows,
            willWatch: willWatchShows,
          }
        : { [toDownload.name]: await getShows([...toDownload.shows]) };
    return json;
  }
  // Create the JSON file
  const json = await createJSON();
  console.log(json);
  // Create the blob
  const blob = new Blob([JSON.stringify(json)], {
    type: "application/json",
  });
  // Create the URL
  const url = URL.createObjectURL(blob);
  // Create the link
  const a = document.createElement("a");
  a.href = url;
  a.download = `${toDownload === "all" ? "watchList" : toDownload.name}.json`;
  // Click on the link
  a.click();
  // Remove the link
  a.remove();
};

//* ------------------------------ Download as Text OR CSV ------------------------------ *//
const downloadAsTextOrCSV = async (format, toDownload) => {
  const watchedShows = await getShows(watched);
  const watchingShows = await getShows(watching);
  const willWatchShows = await getShows(willWatch);
  // Create the text or CSV file
  const createTextOrCSV = async () => {
    const textOrCSV = [];
    // Check if the user wants to download all the watchList or just one of the lists
    if (toDownload === "all") {
      // Create the header
      textOrCSV.push(`Watched,Watching,Will Watch\n`);
      // Create the rows
      for (
        let i = 0;
        i < Math.max(watched.length, watching.length, willWatch.length);
        i++
      ) {
        textOrCSV.push(`${watchedShows[i]?.name || ""},`);
        textOrCSV.push(`${watchingShows[i]?.name || ""},`);
        textOrCSV.push(`${willWatchShows[i]?.name || ""}\n`);
      }
    } else {
      const listShows = await getShows([...toDownload.shows]);
      // Create the header
      textOrCSV.push(`${toDownload.name}\n`);
      // Create the rows
      for (let i = 0; i < listShows.length; i++) {
        textOrCSV.push(`${listShows[i].name}\n`);
      }
    }

    return textOrCSV.join("");
  };
  // Create the text Or CSV file
  const textOrCSV = await createTextOrCSV();
  // Create the blob
  const blob = new Blob([textOrCSV], {
    type: `text/${format === "csv" ? "csv" : "plain"}`,
  });
  // Create the URL
  const url = URL.createObjectURL(blob);
  // Create the link
  const a = document.createElement("a");
  a.href = url;
  a.download = `${
    toDownload === "all" ? "watchList" : toDownload.name
  }.${format}`;
  // Click on the link
  a.click();
  // Remove the link
  a.remove();
};
//* ------------------------------ Download watchList ------------------------------ *//
const downloadList = (format, toDownload) => {
  switch (format) {
    case "pdf":
      downloadAsPDF(toDownload);
      break;
    case "json":
      downloadAsJSON(toDownload);
      break;
    case "csv":
      downloadAsTextOrCSV("csv", toDownload);
      break;
    case "text":
      downloadAsTextOrCSV("txt", toDownload);
      break;
    default:
      break;
  }
};

//* Download all the lists 
// SHow the download all modal
downloadWatchListContainer
  .querySelector("#showDownloadAll")
  .addEventListener("click", () => {
    document
      .getElementById("downloadAllContainer")
      .classList.remove("translate-y-full");
  });
// Hide the download all modal
downloadWatchListContainer
  .querySelector("#hideDownloadAll")
  .addEventListener("click", () => {
    document
      .getElementById("downloadAllContainer")
      .classList.add("translate-y-full");
  });
