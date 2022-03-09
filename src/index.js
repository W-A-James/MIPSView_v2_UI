import * as mips_sim from "mips_sim";
import * as Simulator from "./svg_render";
import "./index.css";

let simulator_diag;

function init_ui_event_handlers() {
    console.log("initializing event handlers");
    document.getElementById("single_step_button").onclick = (e) => {
        mips_sim.step(1);
        simulator_diag.update();
        simulator_diag.draw();
    }

    document.getElementById("step_button").onclick = (e) => {
        let v = document.getElementById('num_steps').value;
        console.log(v);
        v = Number.parseInt(v);
        mips_sim.step(v);
        simulator_diag.update();
        simulator_diag.draw();
    };

    document.getElementById("step_to_halt_button").onclick = (e) => {
        mips_sim.step_to_halt();
        simulator_diag.update();
        simulator_diag.draw();
    };

    document.getElementsByTagName("body")[0].onresize = (e) => {
        simulator_diag.update();
        simulator_diag.draw();
    }

};

console.log("hello from index.js");
simulator_diag = new Simulator.Simulator("#model");
console.log(simulator_diag);
simulator_diag.draw();

mips_sim.init_sim();
init_ui_event_handlers();
