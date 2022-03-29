import * as mips_sim from "mips_sim";
import * as Simulator from "./sim_render";
import * as State from "./state_view";
import * as sample_programs from "./sample_programs";

let simulator_diag;
let programLoaded = false;
let showRegView = true;
let lastBinary = null;
let steps;

let SINGLE_STEP_BUTTON;
let STEP_BUTTON;
let STEP_TO_HALT_BUTTON;
let REGVALS_LIST;
let MEMVALS_LIST;
let REGVIEW_BUTTON;
let LOAD_BINARY_VIEW_BUTTON;
let RELOAD_BUTTON;
let RETURN_TO_MODEL_BUTTON;
let LOAD_PROGRAM_BUTTON;

let NUM_STEPS_INPUT;

let SAMPLE_PROGRAM_CONTAINER;
let SOURCE_VIEW_CONTAINER;
let SAMPLE_PROGRAM_LIST;

let MODEL_CONTAINER;
let STATE_CONTAINER;

const MODEL_SELECTOR = "#model";

const MAX_STEPS = 100;
const MIN_STEPS = 1;


function getDOMHandles() {
  SINGLE_STEP_BUTTON = document.getElementById("single_step_button");
  STEP_BUTTON = document.getElementById("step_button");
  STEP_TO_HALT_BUTTON = document.getElementById("step_to_halt_button");
  REGVALS_LIST = document.getElementById("regvals");
  MEMVALS_LIST = document.getElementById("memvals");
  REGVIEW_BUTTON = document.getElementById("regview-button");
  LOAD_BINARY_VIEW_BUTTON = document.getElementById("load_binary_button");
  RELOAD_BUTTON = document.getElementById("reload_button");
  NUM_STEPS_INPUT = document.getElementById("num_steps");
  SAMPLE_PROGRAM_CONTAINER = document.getElementById("sample_program_container");
  MODEL_CONTAINER = document.getElementById("model_container");
  STATE_CONTAINER = document.getElementById("state_container");
  RETURN_TO_MODEL_BUTTON = document.getElementById("return_to_model")
  LOAD_PROGRAM_BUTTON = document.getElementById("load_selected_program");
  SOURCE_VIEW_CONTAINER = document.getElementById("source_view");
  SAMPLE_PROGRAM_LIST = document.getElementById("sample_program_list");

}

function init_ui_event_handlers() {
  console.log("initializing event handlers");

  // Advance simulator by one cycle
  SINGLE_STEP_BUTTON.onclick = function() {
    mips_sim.step(1);
    update();
  }


  // Ensure that value in NUM_STEPS_INPUT.value is within legal range
  NUM_STEPS_INPUT.onchange = function() {
    let v = NUM_STEPS_INPUT.value;
    steps = Number.parseInt(v);
    if (steps > MAX_STEPS) {
      steps = MAX_STEPS;
      NUM_STEPS_INPUT.value = `${MAX_STEPS}`;
    }
    else if (steps < MIN_STEPS) {
      steps = 1;
      NUM_STEPS_INPUT.value = `${MIN_STEPS}`;
    } else if (isNaN(steps)) {
      NUM_STEPS_INPUT.value = `${MIN_STEPS}`;
    } else if (v.includes(".")) {
      NUM_STEPS_INPUT.value = steps.toString();
    }
  };


  // Read value from input and advance simulator by that many cycles
  STEP_BUTTON.onclick = function() {
    let v = NUM_STEPS_INPUT.value;
    console.log(v);
    v = Number.parseInt(v);
    console.log(v);

    mips_sim.step(v);
    update();
  };

  // TODO: Add a timeout here if running for too long
  STEP_TO_HALT_BUTTON.onclick = function() {
    if (programLoaded) {
      mips_sim.step_to_halt();
      console.log(mips_sim.get_state());
      update();
    }
  };

  // Ensure that model is resized when the document is resized
  document.body.onresize = (_) => {
    simulator_diag.draw();
  };

  // Swap visibility of REGVALS and MEMVALS in state view
  REGVIEW_BUTTON.onclick = function() {
    REGVALS_LIST.classList.toggle("invisible");
    MEMVALS_LIST.classList.toggle("invisible");
    showRegView = !showRegView;
  };

  let toggleLoadBinaryView = function() {
    SAMPLE_PROGRAM_CONTAINER.classList.toggle("invisible");

    MODEL_CONTAINER.classList.toggle("invisible");
    STATE_CONTAINER.classList.toggle("invisible");
  };
  // Switch between model view and load binary view
  LOAD_BINARY_VIEW_BUTTON.onclick = toggleLoadBinaryView;
  RETURN_TO_MODEL_BUTTON.onclick = () => {
    toggleLoadBinaryView();
    simulator_diag.draw();
  }

  // Reinitialize the simulator
  RELOAD_BUTTON.onclick = (_) => {
    reinit();
    update();
    simulator_diag.draw();
  };
};

const BinaryNameSourceMap = {};
let currentlySelectedBinary = sample_programs.PROGRAMS[0].name;

function populateLoadBinaryView() {
  sample_programs.PROGRAMS.forEach(p => {
    let entrySpan = document.createElement("span");
    entrySpan.classList.add("program-entries");
    entrySpan.id = p.name;
    entrySpan.innerText = p.name;

    let key = entrySpan.id;

    let sourceDiv = document.createElement("div");
    sourceDiv.classList.add("invisible");
    p.src.split(/\r?\n/).forEach(line => {
      let codeSpan = document.createElement("span");
      codeSpan.classList.add("code-line");
      codeSpan.innerText = line;

      sourceDiv.append(codeSpan);
    });

    entrySpan.onclick = function(e) {
      let newKey = e.target.id;
      if (currentlySelectedBinary !== newKey) {
        document.getElementById(currentlySelectedBinary).classList.remove("entry-selected"); 
        e.target.classList.add("entry-selected");

        BinaryNameSourceMap[currentlySelectedBinary].classList.add("invisible");
        BinaryNameSourceMap[newKey].classList.remove("invisible");
        currentlySelectedBinary = newKey;
      }
    };

    BinaryNameSourceMap[key] = sourceDiv;

    SAMPLE_PROGRAM_LIST.append(entrySpan);
    SOURCE_VIEW_CONTAINER.append(sourceDiv);
  });
}


function load_binary(b) {
  lastBinary = b;
  mips_sim.init_sim();
  mips_sim.load_binary(b.text, b.data, b.entry);
  programLoaded = true;
}

function reinit() {
  if (lastBinary) {
    load_binary(lastBinary);
  } else {
    mips_sim.init_sim();
  }
}

function start() {
  getDOMHandles();

  NUM_STEPS_INPUT.value = `${MIN_STEPS}`;

  simulator_diag = new Simulator.Simulator(MODEL_SELECTOR);
  mips_sim.init_sim();
  load_binary(sample_programs.FIB);
  update();

  init_ui_event_handlers();
  populateLoadBinaryView();
  console.log(BinaryNameSourceMap);

  let defaultSampleName = sample_programs.PROGRAMS[0].name;
  let defaultSampleSource = BinaryNameSourceMap[sample_programs.PROGRAMS[0].name];
  document.getElementById(defaultSampleName).classList.add("entry-selected");
  defaultSampleSource.classList.remove("invisible");
}

function update() {
  let sim_state = mips_sim.get_state();

  simulator_diag.update(sim_state);
  State.updateUiState(sim_state);
  simulator_diag.draw();
}


start();
