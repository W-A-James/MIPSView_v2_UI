// A dependency graph that contains any wasm must all be imported
// asynchronously. This `bootstrap.js` file does the single async import, so
// that no one else needs to worry about it again.

import("./state_view.js")
    .catch(e => console.error("Error importing state_view.js: ", e));

import("./svg_render.js")
    .catch(e => console.error("Error importing svg_render.js: ", e));

import("./sample_programs.js")
    .catch(e => console.error("Error importing sample_programs.js: ", e));

import("./index.js")
    .catch(e => console.error("Error importing `index.js`:", e));

