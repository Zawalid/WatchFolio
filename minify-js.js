const fs = require("fs");
const uglify = require("uglify-js");

// Array of source files to minify
const sourceFiles = [
  "main.js",
  "show.js",
  "watchList.js",
  "favoritesList.js",
  "download.js",
  "utilities.js",
  "firebaseApp.js",
  "auth.js",
];

// Output directory for minified files
const outputDir = "dist";

// Create the output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const minifyOptions = {
  compress: {
    // Enable aggressive compression options
    sequences: true, // Join consecutive simple statements using the comma operator
    passes: 2, // Perform multiple passes to optimize further
    dead_code: true, // Remove unreachable code
    conditionals: true, // Optimize if-s and conditional expressions
    booleans: true, // Optimize boolean expressions
    loops: true, // Optimize loops
    unused: true, // Drop unused variables and functions
    reduce_vars: true, // Optimize variable names
  },
  mangle: {
    // Enable aggressive mangling options
    toplevel: true, // Mangle top-level variable and function names
  },
  output: {
    // Disable beautification and whitespace
    beautify: false,
    comments: false,
  },
};
// Minify each source file and save the minified output
sourceFiles.forEach((sourceFile) => {
  const sourceCode = fs.readFileSync(`build/js/${sourceFile}`, "utf8");
  const minifiedCode = uglify.minify(sourceCode, minifyOptions).code;
  const outputFileName = sourceFile.replace(".js", ".min.js");
  const outputPath = `${outputDir}/${outputFileName}`;
  fs.writeFileSync(outputPath, minifiedCode);
  console.log(`Minified ${sourceFile} => ${outputPath}`);
});
