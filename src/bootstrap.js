function import_failure(file_name, e) {
  console.error(`Error importing '${file_name}': `, e);
}

import("./state_view.js")
    .catch(e => import_failure("./state_view.js", e));

import ("./component.js")
    .catch(e => import_failure("./component.js", e));

import("./sim_render.js")
    .catch(e => import_failure("./component.js", e));

import("./sample_programs.js")
    .catch(e => import_failure("./sample_programs.js", e));

import("./index.html")
    .catch(e => import_failure("./index.html", e));

import("./index.css")
    .catch(e => import_failure("./index.css", e));

import("./index.js")
    .catch(e => import_failure("./index.js", e));
