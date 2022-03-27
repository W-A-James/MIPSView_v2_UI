import * as mips_sim from "mips_sim";
import * as Simulator from "./sim_render";
import * as State from "./state_view";
import * as sample_programs from "./sample_programs";

let simulator_diag;
let program_loaded = false;
let showRegView = true;
let last_binary = null;
let steps;

function init_ui_event_handlers() {
  console.log("initializing event handlers");
  document.getElementById("single_step_button").onclick = (e) => {
    mips_sim.step(1);
    update();
  }


  let numSteps = document.getElementById('num_steps');
  numSteps.onchange = e => {
    let v = numSteps.value;
    steps = Number.parseInt(v);
    if (steps > 100) {
      steps = 100;
      numSteps.value = "100";
    }
    else if (steps < 1) {
      steps = 1;
      numSteps.value = "1";
    } else if (isNaN(steps)) {
      numSteps.value = "1";
    } else if (v.includes(".")) {
      numSteps.value = steps.toString();
    }

  };


  document.getElementById("step_button").onclick = (e) => {
    let v = numSteps.value;
    console.log(v);
    v = Number.parseInt(v);
    console.log(v);

    mips_sim.step(v);
    update();
  };

  // TODO: Add a timeout here if running for too long
  document.getElementById("step_to_halt_button").onclick = (e) => {
    if (program_loaded) {
      mips_sim.step_to_halt();
      update();
    }
  };

  let swap = e => {
    document.getElementById("regvals").classList.toggle("invisible");
    document.getElementById("memvals").classList.toggle("invisible");
    showRegView = !showRegView;
  };

  document.getElementsByTagName("body")[0].onresize = (e) => {
    simulator_diag.draw();
  }

  document.getElementById("regview-button").onclick = swap;
};


function load_binary(b) {
  last_binary = b;
  mips_sim.load_binary(b.text, b.data, b.entry);
  program_loaded = true;
}

function reinit() {
  if (last_binary) {
    mips_sim.init_sim();
    mips_sim.load_binary(last_binary);
  } else {
    mips_sim.init_sim();
  }
}

function start() {
  document.getElementById('num_steps').value = "1";


  simulator_diag = new Simulator.Simulator("#model");
  mips_sim.init_sim();
  load_binary(sample_programs.FIB);
  update();
  init_ui_event_handlers();
}

function update() {
  let sim_state = mips_sim.get_state();

  simulator_diag.update(sim_state);
  State.updateUiState(sim_state);
  simulator_diag.draw();
}


start();
