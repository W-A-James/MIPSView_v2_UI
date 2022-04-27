function import_failure(file_name, e) {
  console.error(`Error importing '${file_name}': `, e);
}

import("./index.html")
    .catch(e => import_failure("./index.html", e));

import("./index.css")
    .catch(e => import_failure("./index.css", e));

import("./index.js")
    .catch(e => import_failure("./index.js", e));
