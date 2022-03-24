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

const REGNAME_MAP = Object.freeze(
  {
    "A0": 4,
    "A1": 5,
    "A2": 6,
    "A3": 7,
    "AT": 1,
    "FP": 30,
    "GP": 28,
    "HI": 33,
    "LO": 32,
    "K0": 26,
    "K1": 27,
    "RA": 31,
    "S0": 16,
    "S1": 17,
    "S2": 18,
    "S3": 19,
    "S4": 20,
    "S5": 21,
    "S6": 22,
    "S7": 23,
    "SP": 29,
    "T0": 8,
    "T1": 9,
    "T2": 10,
    "T3": 11,
    "T4": 12,
    "T5": 13,
    "T6": 14,
    "T7": 15,
    "T8": 24,
    "T9": 25,
    "V0": 2,
    "V1": 3,
    "ZERO": 0,
  }
);
let REGTABLE = document.getElementById("regtable");
let MEMTABLE = document.getElementById("memtable");
let PC = document.getElementById("program-counter");

function getU32Hex(i) {
  return `0x${Number(i).toString(16).padStart(8, 0).toUpperCase()}`;
}

function renderMemView(simState) {
  let tbody = MEMTABLE.children[0];
  while (tbody.children.length > 1) {
    tbody.children[1].remove();
  }
  let mem = simState.memory.map;
  Object.keys(mem).sort().forEach(k => {
    let row = document.createElement("tr");
    let mem_slot = document.createElement("td");
    mem_slot.innerText = getU32Hex(k);
    let mem_val = document.createElement("td");
    mem_val.innerText = mem[k].toString();
    mem_val.classList.add("right-align");
    let mem_val_hex = document.createElement("td");
    mem_val_hex.innerText = getU32Hex(mem[k]);
    mem_val_hex.classList.add("right-align");

    row.append(mem_slot);
    row.append(mem_val);
    row.append(mem_val_hex);

    tbody.append(row);
  });
  console.log(mem);

}

function renderRegisterView(simState) {
  let tbody = REGTABLE.children[0];
  while (tbody.children.length > 1) {
    tbody.children[1].remove();
  }

  let regs = simState.reg_file.current_map;
  let keys = Object.keys(regs).sort((a, b) => REGNAME_MAP[a] - REGNAME_MAP[b]);
  keys.forEach(k => {
    let row = document.createElement("tr");
    let reg_name = document.createElement("td");
    reg_name.innerText = `${k}`;
    let reg_num = document.createElement("td");
    reg_num.innerText = `\$${REGNAME_MAP[k]}`;
    let value_b10 = document.createElement("td");
    value_b10.classList.add("right-align");
    value_b10.innerText = Number(regs[k]).toString(10).padStart(10, "0");
    let value_hex = document.createElement("td");
    value_hex.classList.add("right-align");
    value_hex.innerText = getU32Hex(regs[k]);

    row.append(reg_name);
    row.append(reg_num);
    row.append(value_b10);
    row.append(value_hex);

    tbody.append(row);
  });
  // Render num cycles
  // Render PC
  // Render other register values in table
  // as hex
}

function renderProgramCounter(simState) {
  if (PC.children.length) PC.removeChild(PC.firstChild);
  let d_span = document.createElement("span");
  let pc = simState.pc.current_map.PC.U32;
  console.log(pc);
  d_span.innerText = `PC: ${getU32Hex(pc)}`;

  PC.append(d_span);
}

function renderProgramSource(simState) { }


function updateUiState(sim_state) {
  renderRegisterView(sim_state);
  renderMemView(sim_state);
  renderProgramCounter(sim_state);
  renderProgramSource(sim_state);
}

export { updateUiState };
