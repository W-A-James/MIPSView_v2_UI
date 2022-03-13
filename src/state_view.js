import * as mips_sim from "mips_sim";

/*
 * This module serves solely to draw and
 * update the state held in the rightmost
 * bar.
 *
 * This contains the register and memory state
 * along with the number of cycles elapsed
 *
 * This would also show the current line of 
 * source code being executed
 * */

/* cSpell:ignore REG, MEM, VALS, REGVALS, REGTABLE, MEMVALS, regs */
/* cSpell:enableCompoundWords */
let REGTABLE = document.getElementById("regtable");
let MEMTABLE = document.getElementById("memtable");

function renderMemView(simState) {
    let tbody = MEMTABLE.children[0];
    while (tbody.children.length > 1) {
        tbody.children[1].remove();
    }
    let mem = simState.memory.map;
    console.log(mem);

}

function renderRegisterView(simState) {
    let tbody = REGTABLE.children[0];
    while (tbody.children.length > 1) {
        tbody.children[1].remove();
    }

    let regs = simState.reg_file.current_map;
    let keys = Object.keys(regs).sort();
    keys.forEach(k => {
        let row = document.createElement("tr");
        let reg_name = document.createElement("td");
        reg_name.innerText = k;
        let value_b10 = document.createElement("td");
        value_b10.innerText = regs[k].toString();
        let value_hex= document.createElement("td");
        value_hex.innerText = `0x${Number(regs[k]).toString(16).padStart(8, 0)}`;

        row.append(reg_name);
        row.append(value_b10);
        row.append(value_hex);

        tbody.append(row);
    });
    // Render num cycles
    // Render PC
    // Render other register values in table
    // as hex
}

function renderProgramSource(simState) {}


function updateUiState(sim_state) {
    renderRegisterView(sim_state);
    renderMemView(sim_state);
    renderProgramSource(sim_state);
}

export {updateUiState};
