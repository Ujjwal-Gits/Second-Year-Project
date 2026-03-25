const fs = require("fs");
const path = require("path");

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (file.endsWith(".jsx") || file.endsWith(".js")) fix(full);
  }
}

function fix(filePath) {
  let src = fs.readFileSync(filePath, "utf8");
  const original = src;

  // Fix: `import.meta.env.VITE_API_URL/path` -> `${import.meta.env.VITE_API_URL}/path`
  src = src.replace(
    /`import\.meta\.env\.VITE_API_URL\//g,
    "`${import.meta.env.VITE_API_URL}/",
  );

  // Fix: `import.meta.env.VITE_API_URL${ -> `${import.meta.env.VITE_API_URL}${
  src = src.replace(
    /`import\.meta\.env\.VITE_API_URL\$\{/g,
    "`${import.meta.env.VITE_API_URL}${",
  );

  // Fix single-quoted: 'import.meta.env.VITE_API_URL/path' -> `${import.meta.env.VITE_API_URL}/path`
  src = src.replace(
    /'import\.meta\.env\.VITE_API_URL\/([^']*)'/g,
    "`${import.meta.env.VITE_API_URL}/$1`",
  );

  // Fix double-quoted: "import.meta.env.VITE_API_URL/path" -> `${import.meta.env.VITE_API_URL}/path`
  src = src.replace(
    /"import\.meta\.env\.VITE_API_URL\/([^"]*)"/g,
    "`${import.meta.env.VITE_API_URL}/$1`",
  );

  // Fix mismatched quotes on BASE_URL lines ending with wrong quote
  src = src.replace(
    /`\$\{import\.meta\.env\.VITE_API_URL\}\/api['"]/g,
    "`${import.meta.env.VITE_API_URL}/api`",
  );
  src = src.replace(
    /['"]\$\{import\.meta\.env\.VITE_API_URL\}\/api`/g,
    "`${import.meta.env.VITE_API_URL}/api`",
  );

  if (src !== original) {
    fs.writeFileSync(filePath, src, "utf8");
    console.log("Fixed:", filePath);
  }
}

walk("hamroyatra/client/src");
console.log("Done");
