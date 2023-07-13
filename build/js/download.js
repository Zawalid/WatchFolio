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
const downloadAsPDF = async () => {
  // Generate the PDF using jsPDF
  const generatePDF = (el) => {
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
const downloadAsJSON = async () => {
  const watchedShows = await getShows(watched);
  const watchingShows = await getShows(watching);
  const willWatchShows = await getShows(willWatch);
  // Create the JSON file
  async function createJSON() {
    const json = {
      watched: watchedShows,
      watching: watchingShows,
      willWatch: willWatchShows,
    };
    return json;
  }
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

//* ------------------------------ Download as CSV ------------------------------ *//
const downloadAsCSV = async () => {
  const watchedShows = await getShows(watched);
  const watchingShows = await getShows(watching);
  const willWatchShows = await getShows(willWatch);
  // Create the CSV file
  const createCSV = async () => {
    const csv = [];
    for (let i = 0; i < watchedShows.length; i++) {
      csv.push(`
      ${watchedShows[i].name},Watched
      `);
    }
    for (let i = 0; i < watchingShows.length; i++) {
      csv.push(`
      ${watchingShows[i].name},Watching
      `);
    }
    for (let i = 0; i < willWatchShows.length; i++) {
      csv.push(`
      ${willWatchShows[i].name},Will Watch
      `);
    }
    return csv.join("");
  };
  // Create the CSV file
  const csv = await createCSV();
  // Create the blob
  const blob = new Blob([csv], {
    type: "text/csv",
  });
  // Create the URL
  const url = URL.createObjectURL(blob);
  // Create the link
  const a = document.createElement("a");
  a.href = url;
  a.download = "watchList.csv";
  // Click on the link
  a.click();
  // Remove the link
  a.remove();
};

//* ------------------------------ Download as Text ------------------------------ *//
const downloadAsText = async () => {
  const watchedShows = await getShows(watched);
  const watchingShows = await getShows(watching);
  const willWatchShows = await getShows(willWatch);
  // Create the text file
  const createText = async () => {
    const text = [];
    for (let i = 0; i < watchedShows.length; i++) {
      text.push(`
      ${watchedShows[i].name}:Watched
      `);
    }
    for (let i = 0; i < watchingShows.length; i++) {
      text.push(`
      ${watchingShows[i].name}:Watching
      `);
    }
    for (let i = 0; i < willWatchShows.length; i++) {
      text.push(`
      ${willWatchShows[i].name}:Will Watch
      `);
    }
    return text.join("");
  };
  // Create the text file
  const text = await createText();
  // Create the blob
  const blob = new Blob([text], {
    type: "text/plain",
  });
  // Create the URL
  const url = URL.createObjectURL(blob);
  // Create the link
  const a = document.createElement("a");
  a.href = url;
  a.download = "watchList.txt";
  // Click on the link
  a.click();
  // Remove the link
  a.remove();
};
//* ------------------------------ Download watchList ------------------------------ *//
const downloadList = (format) => {
  switch (format) {
    case "pdf":
      downloadAsPDF();
      break;
    case "json":
      downloadAsJSON();
      break;
    case "csv":
      downloadAsCSV();
      break;
    case "text":
      downloadAsText();
      break;
    default:
      break;
  }
};
const downloadWatchListContainer = document.getElementById("downloadList");
const downloadInfo = document.getElementById("download_info");

//* Show the download watchList container when clicking on the download button
downloadInfo.addEventListener("click", (e) => {
  if (e.target.closest("#download")) {
    downloadWatchListContainer.classList.add("show");
  }
  if (e.target.closest("i.fa-times")) {
    downloadInfo.remove();
  }
});
//* Close the download watchList container when clicking on the close button or the container and download the watchList when clicking on the download button
downloadWatchListContainer.addEventListener("click", function (e) {
  if (e.target.closest("#close") || e.target === e.currentTarget) {
    this.classList.remove("show");
  }
  if (e.target.closest("#download")) {
    downloadList(
      [...this.querySelectorAll("input")].find((input) => input.checked).value
    );
  }
});
