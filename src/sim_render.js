import * as s from "@svgdotjs/svg.js";
import { Component, Connector, SHAPE, PATH_WIDTH } from "./component";

function makeBox(x, y, w, h) {
  return { x: x, y: y, w: w, h: h, rx: x + w, by: y + h, cx: x + w / 2, cy: y + h / 2 };
}

const CONTROL_OUTLINE = "#0000FF";

const REG_WIDTH = 0.04;
const REG_HEIGHT = 0.70;
const REG_Y_POS = 0.12;

const PC_SPEC = makeBox(0.07, 0.3, 0.02, 0.12);

const PC_MUX_SPEC = makeBox(0.03, 0.3, 0.02, 0.075);
const I_MEM_SPEC = makeBox(0.12, 0.3, 0.06, 0.12);
const PC_ADDER_SPEC = makeBox(0.1, 0.15, 0.06, 0.12);
const BRANCH_AND_SPEC = makeBox(0.15, 0.02, 0.05, 0.06);

const IF_ID_REG_SPEC = makeBox(0.2, REG_Y_POS, REG_WIDTH, REG_HEIGHT);

const HALT_SPEC = makeBox(0.05, 0.5, 0.07, 0.05);
const EPC_SPEC = makeBox(0.05, 0.57, 0.07, 0.05);
const CAUSE_SPEC = makeBox(0.05, 0.64, 0.07, 0.05);

const ID_EX_REG_SPEC = makeBox(0.475, REG_Y_POS, REG_WIDTH, REG_HEIGHT);
const ID_EX_REG_WB_SPEC = Object.assign(makeBox(0.475, REG_Y_POS, REG_WIDTH, 0.05), { outline: CONTROL_OUTLINE });
const ID_EX_REG_MEM_SPEC = Object.assign(makeBox(0.475, REG_Y_POS + 0.05, REG_WIDTH, 0.05), { outline: CONTROL_OUTLINE });
const ID_EX_REG_EX_SPEC = Object.assign(makeBox(0.475, REG_Y_POS + 0.1, REG_WIDTH, 0.05), { outline: CONTROL_OUTLINE });

const REG_FILE_SPEC = makeBox(0.31, 0.4, 0.09, 0.15);
const SIGN_EXT_SPEC = makeBox(0.31, 0.6, 0.042, 0.12);

const LEFT_SHIFT_2_SPEC = makeBox(0.31, 0.3, 0.03, 0.075);
const BRANCH_TARGET_ADDER_SPEC = makeBox(0.35, 0.22, 0.05, 0.084);
const CMP_SPEC = makeBox(0.40, 0.3, 0.03, 0.05);
const DECODE_CONTROL_SPEC = Object.assign(makeBox(0.35, 0.124, 0.045, 0.096), { outline: "#00F" });

const ALU_SPEC = makeBox(0.59, 0.4, 0.05, 0.16);
const MULDIV_SPEC = makeBox(0.59, 0.26, 0.05, 0.12);
const REG_DEST_MUX_SPEC = makeBox(0.54, 0.72, 0.03, 0.1);
const ALU_OP_2_MUX_SPEC = makeBox(0.54, 0.5, 0.03, 0.07);

const EX_MEM_REG_SPEC = makeBox(0.7, REG_Y_POS, REG_WIDTH, REG_HEIGHT);
const EX_MEM_REG_WB_SPEC = Object.assign(makeBox(0.7, REG_Y_POS, REG_WIDTH, 0.05), { outline: CONTROL_OUTLINE });
const EX_MEM_REG_MEM_SPEC = Object.assign(makeBox(0.7, REG_Y_POS + 0.05, REG_WIDTH, 0.05), { outline: CONTROL_OUTLINE });

const D_MEM_SPEC = makeBox(0.76, 0.45, 0.1, 0.15);
const MEM_WB_REG_SPEC = makeBox(0.88, REG_Y_POS, REG_WIDTH, REG_HEIGHT);
const MEM_WB_REG_WB_SPEC = Object.assign(makeBox(0.88, REG_Y_POS, REG_WIDTH, 0.05), { outline: CONTROL_OUTLINE });
const WB_MUX_SPEC = makeBox(0.94, 0.45, 0.03, 0.1);


function genRegStateTable(simState, reg_name, field_header, value_header) {
  let reg = simState[reg_name].current_map;
  let table = document.createElement("table");
  let keys = Object.keys(reg).sort();
  keys.forEach(k => {
    let row = document.createElement("tr");
    let fieldName = document.createElement("td");
    fieldName.innerText = `${k}`;
    let value = document.createElement("td");
    let inner = Object.keys(reg[k])[0];
    switch (inner) {
      case "Op":
      case "ALU":
      case "Branch":
      case "RSrc":
      case "Dest":
      case "Bool":
        value.innerText = `${reg[k][inner]}`;
        break;
      case "U8":
        value.innerText = `0x${Number(reg[k][inner]).toString(16).padStart(2, 0).toUpperCase()}`;
        break;
      case "U32":
        value.innerText = `0x${Number(reg[k][inner]).toString(16).padStart(8, 0).toUpperCase()}`;
        break;
      case "U64":
        value.innerText = `0x${Number(reg[k][inner]).toString(16).padStart(16, 0).toUpperCase()}`;
        break;
      default:
        console.error(`Unaccounted for case: ${inner}`);
    }
    row.append(fieldName, value);
    table.append(row);
  });
  return table;

}
class Simulator {
  constructor(target_element) {
    this.target_element = target_element;
    this.drawing = s.SVG().addTo(this.target_element).size("100%", "100%");
    this.state = null;

    let halt_reg = new Component(this, HALT_SPEC, "HALT", [], SHAPE.BOX, "HALT", { has: true, updateState: () => genRegStateTable(this.state, "halt") });
    let cause_reg = new Component(this, CAUSE_SPEC, "CAUSE", [], SHAPE.BOX, "CAUSE", { has: true, updateState: () => genRegStateTable(this.state, "cause_reg") });
    let epc_reg = new Component(this, EPC_SPEC, "EPC", [], SHAPE.BOX, "EPC", { has: true, updateState: () => genRegStateTable(this.state, "epc_reg") });
    let pc = new Component(this, PC_SPEC, "PC",
      [
        new Connector(this,
          [
            PC_SPEC.x + PC_SPEC.w, PC_SPEC.y + PC_SPEC.h / 2,
            I_MEM_SPEC.x, PC_SPEC.y + PC_SPEC.h / 2
          ],
          PATH_WIDTH,
        ),
        new Connector(this,
          [
            PC_SPEC.x + PC_SPEC.w + 0.005, PC_SPEC.y + PC_SPEC.h / 2,
            PC_SPEC.x + PC_SPEC.w + 0.005, PC_ADDER_SPEC.y + PC_ADDER_SPEC.h / 4,
            PC_ADDER_SPEC.x, PC_ADDER_SPEC.y + PC_ADDER_SPEC.h / 4
          ], PATH_WIDTH, {start: true, end: true }
        )
      ]
      , SHAPE.BOX, "reg", { has: true, updateState: () => genRegStateTable(this.state, "pc") });
    let is_branch_and = new Component(this, BRANCH_AND_SPEC, "AND", [
      new Connector(this, [
        BRANCH_AND_SPEC.x, BRANCH_AND_SPEC.cy,
        PC_MUX_SPEC.cx, BRANCH_AND_SPEC.cy,
        PC_MUX_SPEC.cx, PC_MUX_SPEC.y,
      ])], SHAPE.AND);
    let pc_mux = new Component(this, PC_MUX_SPEC, "Mux", [
      new Connector(this,
        [
          PC_MUX_SPEC.rx, PC_MUX_SPEC.cy,
          PC_SPEC.x, PC_MUX_SPEC.y + PC_MUX_SPEC.h / 2
        ]
      )
    ]);
    let i_mem = new Component(this, I_MEM_SPEC, "Instruction\nMemory", [
      new Connector(this, [
        I_MEM_SPEC.x + I_MEM_SPEC.w, I_MEM_SPEC.y + I_MEM_SPEC.h / 2,
        IF_ID_REG_SPEC.x, I_MEM_SPEC.y + I_MEM_SPEC.h / 2
      ])
    ]);
    let pc_adder = new Component(this, PC_ADDER_SPEC, "Add", [
      /* Adder to IF_ID_REG */
      new Connector(this,
        [
          PC_ADDER_SPEC.x + PC_ADDER_SPEC.w, PC_ADDER_SPEC.y + PC_ADDER_SPEC.h / 2,
          IF_ID_REG_SPEC.x, PC_ADDER_SPEC.y + PC_ADDER_SPEC.h / 2
        ]),
      /* Adder to PC mux */
      new Connector(this,
        [
          (PC_ADDER_SPEC.x + PC_ADDER_SPEC.w + IF_ID_REG_SPEC.x) / 2, PC_ADDER_SPEC.y + PC_ADDER_SPEC.h / 2,
          (PC_ADDER_SPEC.x + PC_ADDER_SPEC.w + IF_ID_REG_SPEC.x) / 2, PC_ADDER_SPEC.y - PC_ADDER_SPEC.h / 2,
          (PC_MUX_SPEC.x - PC_MUX_SPEC.w / 2), PC_ADDER_SPEC.y - PC_ADDER_SPEC.h / 2,
          (PC_MUX_SPEC.x - PC_MUX_SPEC.w / 2), PC_MUX_SPEC.y + PC_MUX_SPEC.h / 4,
          PC_MUX_SPEC.x, PC_MUX_SPEC.y + PC_MUX_SPEC.h / 4,
        ]
      ),
      Connector.horizontal(this, PC_ADDER_SPEC.x - PC_ADDER_SPEC.w / 3, PC_ADDER_SPEC.x, PC_ADDER_SPEC.by - PC_ADDER_SPEC.h / 5, PATH_WIDTH, { start: false, end: true, startText: "4" })
    ], SHAPE.ARITH);
    let if_id_reg = new Component(this, IF_ID_REG_SPEC, "IF/ID", [
      /* Reg read 1 */
      new Connector(this, [
        IF_ID_REG_SPEC.x + IF_ID_REG_SPEC.w, REG_FILE_SPEC.y + REG_FILE_SPEC.h / 5,
        REG_FILE_SPEC.x, REG_FILE_SPEC.y + REG_FILE_SPEC.h / 5
      ], PATH_WIDTH, { start: false, end: true, endText: " read_1" }
      ),
      /* TODO: Reg read 2*/
      new Connector(this, [
        IF_ID_REG_SPEC.x + IF_ID_REG_SPEC.w, REG_FILE_SPEC.y + REG_FILE_SPEC.h * 2 / 5,
        REG_FILE_SPEC.x, REG_FILE_SPEC.y + REG_FILE_SPEC.h * 2 / 5
      ], PATH_WIDTH, { start: false, end: true, endText: " read_2" }),
      /* Vertical line holding instruction  */
      new Connector(this, [
        (IF_ID_REG_SPEC.rx + REG_FILE_SPEC.x) / 2, DECODE_CONTROL_SPEC.y + DECODE_CONTROL_SPEC.h / 2,
        (IF_ID_REG_SPEC.rx + REG_FILE_SPEC.x) / 2, SIGN_EXT_SPEC.by + SIGN_EXT_SPEC.h * 2 / 3,
      ], PATH_WIDTH, { start: false, end: false }),
      /* To Control */
      new Connector(this, [
        (IF_ID_REG_SPEC.rx + REG_FILE_SPEC.x) / 2, DECODE_CONTROL_SPEC.cy,
        DECODE_CONTROL_SPEC.x, DECODE_CONTROL_SPEC.cy,
      ], PATH_WIDTH, { start: true, end: true }),
      /* To Sign Extend */
      new Connector(this, [
        (IF_ID_REG_SPEC.rx + REG_FILE_SPEC.x) / 2, SIGN_EXT_SPEC.cy,
        SIGN_EXT_SPEC.x, SIGN_EXT_SPEC.cy,
      ], PATH_WIDTH, { start: true, end: true }),
      /* Instr[20:16] */
      new Connector(this, [
        (IF_ID_REG_SPEC.rx + REG_FILE_SPEC.x) / 2, SIGN_EXT_SPEC.by + SIGN_EXT_SPEC.h / 3,
        ID_EX_REG_SPEC.x, SIGN_EXT_SPEC.by + SIGN_EXT_SPEC.h / 3,
      ], PATH_WIDTH, { start: true, end: true }),
      /* Instr[15:11] */
      new Connector(this, [
        (IF_ID_REG_SPEC.rx + REG_FILE_SPEC.x) / 2, SIGN_EXT_SPEC.by + SIGN_EXT_SPEC.h * 2 / 3,
        ID_EX_REG_SPEC.x, SIGN_EXT_SPEC.by + SIGN_EXT_SPEC.h * 2 / 3,
      ], PATH_WIDTH, { start: true, end: true }),
      /* PC Plus 4 */
      new Connector(this, [
        IF_ID_REG_SPEC.rx, PC_ADDER_SPEC.cy,
        (IF_ID_REG_SPEC.rx + BRANCH_TARGET_ADDER_SPEC.x) / 2, PC_ADDER_SPEC.cy,
        (IF_ID_REG_SPEC.rx + BRANCH_TARGET_ADDER_SPEC.x) / 2, BRANCH_TARGET_ADDER_SPEC.y + BRANCH_TARGET_ADDER_SPEC.h / 3,
        BRANCH_TARGET_ADDER_SPEC.x, BRANCH_TARGET_ADDER_SPEC.y + BRANCH_TARGET_ADDER_SPEC.h / 3,

      ])
      /* T*/
    ], SHAPE.BOX, "", {
      has: true, description: "<p>Fetch/Decode Register</p><p>Buffers State between fetch stage and Decode stage</p>", updateState: () => {
        return genRegStateTable(this.state, "if_id_reg");
      }
    }
    );
    let reg_file = new Component(this, REG_FILE_SPEC, "Reg File", [
      /* Reg data 1*/
      Connector.horizontal(this, REG_FILE_SPEC.rx, ID_EX_REG_SPEC.x, REG_FILE_SPEC.y + REG_FILE_SPEC.h / 5, PATH_WIDTH, { start: false, end: true, startText: "reg_1" }),
      /* To cmp 1 */
      Connector.vertical(this, REG_FILE_SPEC.y + REG_FILE_SPEC.h / 5, CMP_SPEC.by, CMP_SPEC.x + CMP_SPEC.w / 3, PATH_WIDTH, { start: true, end: true }),
      /* Reg data 2*/
      Connector.horizontal(this, REG_FILE_SPEC.rx, ID_EX_REG_SPEC.x, REG_FILE_SPEC.y + REG_FILE_SPEC.h * 2 / 5, PATH_WIDTH, { end: true, startText: "reg_2" }),
      /* To cmp 2 */
      Connector.vertical(this, REG_FILE_SPEC.y + REG_FILE_SPEC.h * 2 / 5, CMP_SPEC.by, CMP_SPEC.x + CMP_SPEC.w * 2 / 3, PATH_WIDTH, { start: true, end: true }),
    ], SHAPE.BOX, "", {
      has: true, description: "<p>Register File</p><p>This component holds the data the processor needs to work with immediately</p>", updateState: () => {
        let regs = this.state.reg_file.current_map;
        let keys = Object.keys(regs).sort();
        let table = document.createElement("table");
        keys.forEach(k => {
          let row = document.createElement("tr");
          let regName = document.createElement("td");
          regName.innerText = `${k}`;
          let valueHex = document.createElement("td");
          valueHex.innerText = `0x${Number(regs[k]).toString(16).padStart(8, 0).toUpperCase()}`;
          row.append(regName, valueHex);
          table.append(row);
        });
        return table;
        // Get register state
        // produce table
      }
    });

    let sign_extend = new Component(this, SIGN_EXT_SPEC, "Sign\nExtend", [
      Connector.horizontal(this, SIGN_EXT_SPEC.rx, ID_EX_REG_SPEC.x, SIGN_EXT_SPEC.cy),
      new Connector(this, [
        (CMP_SPEC.rx + ID_EX_REG_SPEC.x) / 2, SIGN_EXT_SPEC.cy,
        (CMP_SPEC.rx + ID_EX_REG_SPEC.x) / 2, (REG_FILE_SPEC.y + CMP_SPEC.by) / 2,
        (CMP_SPEC.x + REG_FILE_SPEC.cx) / 2, (REG_FILE_SPEC.y + CMP_SPEC.by) / 2,
        (CMP_SPEC.x + REG_FILE_SPEC.cx) / 2, LEFT_SHIFT_2_SPEC.cy,
        LEFT_SHIFT_2_SPEC.rx, LEFT_SHIFT_2_SPEC.cy,
      ])
    ], SHAPE.CIRCLE);

    let left_shift_2 = new Component(this, LEFT_SHIFT_2_SPEC, "<<2", [
      new Connector(this, [
        LEFT_SHIFT_2_SPEC.cx, LEFT_SHIFT_2_SPEC.y,
        LEFT_SHIFT_2_SPEC.cx, BRANCH_TARGET_ADDER_SPEC.y + BRANCH_TARGET_ADDER_SPEC.h * 2 / 3,
        BRANCH_TARGET_ADDER_SPEC.x, BRANCH_TARGET_ADDER_SPEC.y + BRANCH_TARGET_ADDER_SPEC.h * 2 / 3,

      ])
    ]);

    let bt_adder = new Component(this, BRANCH_TARGET_ADDER_SPEC, "Add", [
      new Connector(this, [
        BRANCH_TARGET_ADDER_SPEC.rx, BRANCH_TARGET_ADDER_SPEC.cy,
        (BRANCH_TARGET_ADDER_SPEC.rx + ID_EX_REG_SPEC.x) / 2, BRANCH_TARGET_ADDER_SPEC.cy,
        (BRANCH_TARGET_ADDER_SPEC.rx + ID_EX_REG_SPEC.x) / 2, BRANCH_AND_SPEC.y - BRANCH_AND_SPEC.h / 5,
        (PC_MUX_SPEC.x - PC_MUX_SPEC.w * 4 / 3), BRANCH_AND_SPEC.y - BRANCH_AND_SPEC.h / 5,
        (PC_MUX_SPEC.x - PC_MUX_SPEC.w * 4 / 3), PC_MUX_SPEC.y + PC_MUX_SPEC.h * 2 / 3,
        (PC_MUX_SPEC.x), PC_MUX_SPEC.y + PC_MUX_SPEC.h * 2 / 3,
      ]),
    ], SHAPE.ARITH);

    let cmp = new Component(this, CMP_SPEC, "Cmp", [
      new Connector(this, [
        CMP_SPEC.cx, CMP_SPEC.y,
        CMP_SPEC.cx, BRANCH_AND_SPEC.y + BRANCH_AND_SPEC.h * 2 / 3,
        BRANCH_AND_SPEC.rx, BRANCH_AND_SPEC.y + BRANCH_AND_SPEC.h * 2 / 3
      ])
    ]);

    let decode_control = new Component(this, DECODE_CONTROL_SPEC, "Control", [
      new Connector(this, [
        DECODE_CONTROL_SPEC.cx, DECODE_CONTROL_SPEC.y,
        DECODE_CONTROL_SPEC.cx, BRANCH_AND_SPEC.y + BRANCH_AND_SPEC.h / 3,
        BRANCH_AND_SPEC.rx, BRANCH_AND_SPEC.y + BRANCH_AND_SPEC.h / 3,
      ],
        PATH_WIDTH,
        { end: true },
        { color: CONTROL_OUTLINE }
      ),
      Connector.horizontal(this, DECODE_CONTROL_SPEC.rx, (DECODE_CONTROL_SPEC.rx + (ID_EX_REG_SPEC.x - DECODE_CONTROL_SPEC.rx) * (4 / 5)), DECODE_CONTROL_SPEC.cy, PATH_WIDTH, { start: false, end: false }, { color: CONTROL_OUTLINE }),
      Connector.vertical(this, ID_EX_REG_WB_SPEC.cy, ID_EX_REG_EX_SPEC.cy, (DECODE_CONTROL_SPEC.rx + (ID_EX_REG_SPEC.x - DECODE_CONTROL_SPEC.rx) * (4 / 5)), PATH_WIDTH, { start: false, end: false }, { color: CONTROL_OUTLINE }),
      Connector.horizontal(this, (DECODE_CONTROL_SPEC.rx + (ID_EX_REG_SPEC.x - DECODE_CONTROL_SPEC.rx) * (4 / 5)), ID_EX_REG_WB_SPEC.x, ID_EX_REG_WB_SPEC.cy, PATH_WIDTH, { start: false, end: true }, { color: CONTROL_OUTLINE }),
      Connector.horizontal(this, (DECODE_CONTROL_SPEC.rx + (ID_EX_REG_SPEC.x - DECODE_CONTROL_SPEC.rx) * (4 / 5)), ID_EX_REG_MEM_SPEC.x, ID_EX_REG_MEM_SPEC.cy, PATH_WIDTH, { start: true, end: true }, { color: CONTROL_OUTLINE }),
      Connector.horizontal(this, (DECODE_CONTROL_SPEC.rx + (ID_EX_REG_SPEC.x - DECODE_CONTROL_SPEC.rx) * (4 / 5)), ID_EX_REG_EX_SPEC.x, ID_EX_REG_EX_SPEC.cy, PATH_WIDTH, { start: false, end: true }, { color: CONTROL_OUTLINE })
    ], SHAPE.CIRCLE, "control");

    let id_ex_reg = new Component(this, ID_EX_REG_SPEC, "ID/EX", [
      Connector.horizontal(this, ID_EX_REG_SPEC.rx, REG_DEST_MUX_SPEC.x, SIGN_EXT_SPEC.by + SIGN_EXT_SPEC.h / 3),
      Connector.horizontal(this, ID_EX_REG_SPEC.rx, REG_DEST_MUX_SPEC.x, SIGN_EXT_SPEC.by + SIGN_EXT_SPEC.h * 2 / 3),
      Connector.horizontal(this, ID_EX_REG_SPEC.rx, ALU_SPEC.x, REG_FILE_SPEC.y + REG_FILE_SPEC.h / 5),
      Connector.horizontal(this, ID_EX_REG_SPEC.rx, ALU_OP_2_MUX_SPEC.x, ALU_OP_2_MUX_SPEC.y + ALU_OP_2_MUX_SPEC.h * 2 / 3),
      new Connector(this, [
        ID_EX_REG_SPEC.rx, REG_FILE_SPEC.y + REG_FILE_SPEC.h * 2 / 5,
        ID_EX_REG_SPEC.rx + (ALU_OP_2_MUX_SPEC.x - ID_EX_REG_SPEC.rx) / 3, REG_FILE_SPEC.y + REG_FILE_SPEC.h * 2 / 5,
        ID_EX_REG_SPEC.rx + (ALU_OP_2_MUX_SPEC.x - ID_EX_REG_SPEC.rx) / 3, ALU_OP_2_MUX_SPEC.y + ALU_OP_2_MUX_SPEC.h / 3,
        ALU_OP_2_MUX_SPEC.x, ALU_OP_2_MUX_SPEC.y + ALU_OP_2_MUX_SPEC.h / 3,
      ]),
      new Connector(this, [
        (ALU_OP_2_MUX_SPEC.x + ID_EX_REG_SPEC.rx) / 2, ALU_OP_2_MUX_SPEC.y + ALU_OP_2_MUX_SPEC.h / 3,
        (ALU_OP_2_MUX_SPEC.x + ID_EX_REG_SPEC.rx) / 2, D_MEM_SPEC.by - D_MEM_SPEC.h / 7,
        EX_MEM_REG_SPEC.x, D_MEM_SPEC.by - D_MEM_SPEC.h / 7,
      ], PATH_WIDTH, { start: true, end: true }),
      new Connector(this, [
        (ID_EX_REG_SPEC.rx + MULDIV_SPEC.x) / 2.1, REG_FILE_SPEC.y + REG_FILE_SPEC.h / 5,
        (ID_EX_REG_SPEC.rx + MULDIV_SPEC.x) / 2.1, MULDIV_SPEC.y + MULDIV_SPEC.h / 3,
        MULDIV_SPEC.x, MULDIV_SPEC.y + MULDIV_SPEC.h / 3,
      ], PATH_WIDTH, { start: true, end: true }),
      new Connector(this, [
        (ID_EX_REG_SPEC.rx + (ALU_OP_2_MUX_SPEC.x - ID_EX_REG_SPEC.rx) / 3), REG_FILE_SPEC.y + REG_FILE_SPEC.h * 2 / 5,
        (ID_EX_REG_SPEC.rx + (ALU_OP_2_MUX_SPEC.x - ID_EX_REG_SPEC.rx) / 3), MULDIV_SPEC.y + MULDIV_SPEC.h * 2 / 3,
        MULDIV_SPEC.x, MULDIV_SPEC.y + MULDIV_SPEC.h * 2 / 3,
      ], PATH_WIDTH, { start: true, end: true })
    ], (_e) => {
    }, SHAPE.BOX, { has: true, updateState: () => genRegStateTable(this.state, "id_ex_reg") });

    let id_ex_reg_wb = new Component(this, ID_EX_REG_WB_SPEC, "", [
      Connector.horizontal(this, ID_EX_REG_WB_SPEC.rx, EX_MEM_REG_SPEC.x, ID_EX_REG_WB_SPEC.cy, PATH_WIDTH, {}, { color: CONTROL_OUTLINE })
    ]);

    let id_ex_reg_mem = new Component(this, ID_EX_REG_MEM_SPEC, "", [
      Connector.horizontal(this, ID_EX_REG_MEM_SPEC.rx, EX_MEM_REG_SPEC.x, ID_EX_REG_MEM_SPEC.cy, PATH_WIDTH, {}, { color: CONTROL_OUTLINE })
    ]);

    let id_ex_reg_ex = new Component(this, ID_EX_REG_EX_SPEC, "", [
      new Connector(this, [
        ID_EX_REG_EX_SPEC.rx, ID_EX_REG_EX_SPEC.y + ID_EX_REG_EX_SPEC.h * 3 / 4,
        ALU_OP_2_MUX_SPEC.cx, ID_EX_REG_EX_SPEC.y + ID_EX_REG_EX_SPEC.h * 3 / 4,
        ALU_OP_2_MUX_SPEC.cx, ALU_OP_2_MUX_SPEC.y,
      ], PATH_WIDTH, {}, { color: CONTROL_OUTLINE }),
      new Connector(this, [
        ID_EX_REG_EX_SPEC.rx, ID_EX_REG_EX_SPEC.y + ID_EX_REG_EX_SPEC.h / 4,
        ALU_SPEC.rx + (EX_MEM_REG_SPEC.x - ALU_SPEC.rx) / 3, ID_EX_REG_EX_SPEC.y + ID_EX_REG_EX_SPEC.h / 4,
        ALU_SPEC.rx + (EX_MEM_REG_SPEC.x - ALU_SPEC.rx) / 3, REG_DEST_MUX_SPEC.by + REG_DEST_MUX_SPEC.h / 4,
        REG_DEST_MUX_SPEC.cx, REG_DEST_MUX_SPEC.by + REG_DEST_MUX_SPEC.h / 4,
        REG_DEST_MUX_SPEC.cx, REG_DEST_MUX_SPEC.by,

      ], PATH_WIDTH, {}, { color: CONTROL_OUTLINE }),
      new Connector(this, [
        ID_EX_REG_EX_SPEC.rx, ID_EX_REG_EX_SPEC.y + ID_EX_REG_EX_SPEC.h * 1 / 2,
        ALU_SPEC.rx + (EX_MEM_REG_SPEC.x - ALU_SPEC.rx) * 2 / 3, ID_EX_REG_EX_SPEC.y + ID_EX_REG_EX_SPEC.h * 1 / 2,
        ALU_SPEC.rx + (EX_MEM_REG_SPEC.x - ALU_SPEC.rx) * 2 / 3, ALU_SPEC.by + ALU_SPEC.h / 6,
        ALU_SPEC.rx - ALU_SPEC.w / 3, ALU_SPEC.by + ALU_SPEC.h / 6,
        ALU_SPEC.rx - ALU_SPEC.w / 3, ALU_SPEC.by * 0.939,
      ], PATH_WIDTH, {}, { color: CONTROL_OUTLINE }),
      new Connector(this, [
        MULDIV_SPEC.cx, ID_EX_REG_EX_SPEC.y + ID_EX_REG_EX_SPEC.h * 1 / 2,
        MULDIV_SPEC.cx, MULDIV_SPEC.y
      ], PATH_WIDTH,
        { start: true, end: true },
        { color: CONTROL_OUTLINE })
    ]);

    let muldiv = new Component(this, MULDIV_SPEC, "MULDIV", [
      Connector.horizontal(this, MULDIV_SPEC.rx, EX_MEM_REG_SPEC.x, MULDIV_SPEC.cy),
    ], SHAPE.BOX);
    let alu = new Component(this, ALU_SPEC, "ALU", [
      Connector.horizontal(this, ALU_SPEC.rx, EX_MEM_REG_SPEC.x, ALU_SPEC.cy)
    ], SHAPE.ARITH);
    let reg_dest_mux = new Component(this, REG_DEST_MUX_SPEC, "Mux", [
      Connector.horizontal(this, REG_DEST_MUX_SPEC.rx, EX_MEM_REG_SPEC.x, REG_DEST_MUX_SPEC.cy)
    ]);
    let alu_op_2_mux = new Component(this, ALU_OP_2_MUX_SPEC, "Mux", [
      Connector.horizontal(this, ALU_OP_2_MUX_SPEC.rx, ALU_SPEC.x, ALU_OP_2_MUX_SPEC.cy)
    ]);
    let ex_mem_reg = new Component(this, EX_MEM_REG_SPEC, "EX/MEM", [
      Connector.horizontal(this, EX_MEM_REG_SPEC.rx, D_MEM_SPEC.x, ALU_SPEC.cy, PATH_WIDTH, { start: false, end: true, endText: " addr" }),
      new Connector(this, [
        (EX_MEM_REG_SPEC.rx + D_MEM_SPEC.x) / 2, ALU_SPEC.cy,
        (EX_MEM_REG_SPEC.rx + D_MEM_SPEC.x) / 2, D_MEM_SPEC.by + D_MEM_SPEC.h / 4,
        MEM_WB_REG_SPEC.x, D_MEM_SPEC.by + D_MEM_SPEC.h / 4,
      ], PATH_WIDTH, { start: true, end: true }),
      Connector.horizontal(this, EX_MEM_REG_SPEC.rx, MEM_WB_REG_SPEC.x, REG_DEST_MUX_SPEC.cy, PATH_WIDTH),
      Connector.horizontal(this, EX_MEM_REG_SPEC.rx, D_MEM_SPEC.x, D_MEM_SPEC.by - D_MEM_SPEC.h / 7, PATH_WIDTH, {endText: " data"}),
      Connector.horizontal(this, EX_MEM_REG_SPEC.rx, MEM_WB_REG_SPEC.x, MULDIV_SPEC.cy),
    ], SHAPE.BOX, "", { has: true, updateState: () => genRegStateTable(this.state, "ex_mem_reg") });
    let ex_mem_reg_wb = new Component(this, EX_MEM_REG_WB_SPEC, "", [
      Connector.horizontal(this, EX_MEM_REG_WB_SPEC.rx, MEM_WB_REG_WB_SPEC.x, EX_MEM_REG_WB_SPEC.cy, PATH_WIDTH, { start: false, end: true }, { color: CONTROL_OUTLINE })
    ], SHAPE.BOX, "");
    let ex_mem_reg_mem = new Component(this, EX_MEM_REG_MEM_SPEC, "", [
      new Connector(this, [
        EX_MEM_REG_MEM_SPEC.rx, EX_MEM_REG_MEM_SPEC.y + EX_MEM_REG_MEM_SPEC.h / 3,
        D_MEM_SPEC.cx, EX_MEM_REG_MEM_SPEC.y + EX_MEM_REG_MEM_SPEC.h / 3,
        D_MEM_SPEC.cx, D_MEM_SPEC.y
      ], PATH_WIDTH, {}, { color: CONTROL_OUTLINE }),
      new Connector(this, [
        EX_MEM_REG_MEM_SPEC.rx, EX_MEM_REG_MEM_SPEC.y + EX_MEM_REG_MEM_SPEC.h * 2 / 3,
        EX_MEM_REG_MEM_SPEC.rx + (D_MEM_SPEC.x - EX_MEM_REG_MEM_SPEC.rx) / 4, EX_MEM_REG_MEM_SPEC.y + EX_MEM_REG_MEM_SPEC.h * 2 / 3,
        EX_MEM_REG_MEM_SPEC.rx + (D_MEM_SPEC.x - EX_MEM_REG_MEM_SPEC.rx) / 4, D_MEM_SPEC.by + D_MEM_SPEC.h * 1 / 3,
        D_MEM_SPEC.cx, D_MEM_SPEC.by + D_MEM_SPEC.h * 1 / 3,
        D_MEM_SPEC.cx, D_MEM_SPEC.by,
      ], PATH_WIDTH, {}, { color: CONTROL_OUTLINE }),

    ]);
    let dmem = new Component(this, D_MEM_SPEC, "Data\nMemory", [
      Connector.horizontal(this, D_MEM_SPEC.rx, MEM_WB_REG_SPEC.x, ALU_SPEC.cy, PATH_WIDTH, { start: false, end: true })
    ]);
    let mem_wb_reg = new Component(this, MEM_WB_REG_SPEC, "MEM/WB", [
      Connector.horizontal(this, MEM_WB_REG_SPEC.rx, WB_MUX_SPEC.x, ALU_SPEC.cy, PATH_WIDTH, { start: false, end: true }),
      new Connector(this, [
        MEM_WB_REG_SPEC.rx, D_MEM_SPEC.by + D_MEM_SPEC.h / 4,
        (MEM_WB_REG_SPEC.rx + WB_MUX_SPEC.x) / 2, D_MEM_SPEC.by + D_MEM_SPEC.h / 4,
        (MEM_WB_REG_SPEC.rx + WB_MUX_SPEC.x) / 2, WB_MUX_SPEC.y + WB_MUX_SPEC.h * 2 / 3,
        WB_MUX_SPEC.x, WB_MUX_SPEC.y + WB_MUX_SPEC.h * 2 / 3,
      ], PATH_WIDTH, { start: false, end: true }),
      new Connector(this, [
        MEM_WB_REG_SPEC.rx, REG_DEST_MUX_SPEC.cy,
        (MEM_WB_REG_SPEC.rx + WB_MUX_SPEC.x) / 2, REG_DEST_MUX_SPEC.cy,
        (MEM_WB_REG_SPEC.rx + WB_MUX_SPEC.x) / 2, MEM_WB_REG_SPEC.by + MEM_WB_REG_SPEC.h / 12,
        (IF_ID_REG_SPEC.rx + (REG_FILE_SPEC.x - IF_ID_REG_SPEC.rx) * 3 / 4), MEM_WB_REG_SPEC.by + MEM_WB_REG_SPEC.h / 12,
        (IF_ID_REG_SPEC.rx + (REG_FILE_SPEC.x - IF_ID_REG_SPEC.rx) * 3 / 4), REG_FILE_SPEC.y + REG_FILE_SPEC.h * 3 / 5,
        REG_FILE_SPEC.x, REG_FILE_SPEC.y + REG_FILE_SPEC.h * 3 / 5
      ], PATH_WIDTH, { start: false, end: true, endText: " reg_addr"}),
      new Connector(this, [
        MEM_WB_REG_SPEC.rx, MULDIV_SPEC.cy,
        1.0 - REG_DEST_MUX_SPEC.w / 5, MULDIV_SPEC.cy,
        1.0 - REG_DEST_MUX_SPEC.w / 5, 0.9,
        REG_FILE_SPEC.rx - REG_FILE_SPEC.w / 4, 0.9,
        REG_FILE_SPEC.rx - REG_FILE_SPEC.w / 4, REG_FILE_SPEC.by

      ], PATH_WIDTH, { start: false, end: true, endText:"md_res" })
    ], SHAPE.BOX, "", { has: true, updateState: () => genRegStateTable(this.state, "mem_wb_reg") });
    let mem_wb_reg_wb = new Component(this, MEM_WB_REG_WB_SPEC, "", [
      new Connector(this, [
        MEM_WB_REG_WB_SPEC.rx, MEM_WB_REG_WB_SPEC.y + MEM_WB_REG_WB_SPEC.h * 2 / 3,
        WB_MUX_SPEC.cx, MEM_WB_REG_WB_SPEC.y + MEM_WB_REG_WB_SPEC.h * 2 / 3,
        WB_MUX_SPEC.cx, WB_MUX_SPEC.y
      ], PATH_WIDTH, { start: false, end: true }, { color: CONTROL_OUTLINE }),
      new Connector(this, [
        MEM_WB_REG_WB_SPEC.rx, MEM_WB_REG_WB_SPEC.y + MEM_WB_REG_WB_SPEC.h / 3,
        WB_MUX_SPEC.rx + (1.0 - WB_MUX_SPEC.rx) * 2 / 3, MEM_WB_REG_WB_SPEC.y + MEM_WB_REG_WB_SPEC.h / 3,
        WB_MUX_SPEC.rx + (1.0 - WB_MUX_SPEC.rx) * 2 / 3, MEM_WB_REG_SPEC.by + (1.0 - MEM_WB_REG_SPEC.by) * 2 / 3,
        REG_FILE_SPEC.cx, MEM_WB_REG_SPEC.by + (1.0 - MEM_WB_REG_SPEC.by) * 2 / 3,
        REG_FILE_SPEC.cx, REG_FILE_SPEC.by

      ], PATH_WIDTH, {endText: "w"}, { color: CONTROL_OUTLINE })
    ]);
    let wb_mux = new Component(this, WB_MUX_SPEC, "Mux", [
      new Connector(this, [
        WB_MUX_SPEC.rx, WB_MUX_SPEC.cy,
        WB_MUX_SPEC.rx + (1.0 - WB_MUX_SPEC.rx) / 3, WB_MUX_SPEC.cy,
        WB_MUX_SPEC.rx + (1.0 - WB_MUX_SPEC.rx) / 3, MEM_WB_REG_SPEC.by + (MEM_WB_REG_SPEC.h / 8),
        IF_ID_REG_SPEC.rx + (REG_FILE_SPEC.x - IF_ID_REG_SPEC.rx) * 6 / 7, MEM_WB_REG_SPEC.by + (MEM_WB_REG_SPEC.h / 8),
        IF_ID_REG_SPEC.rx + (REG_FILE_SPEC.x - IF_ID_REG_SPEC.rx) * 6 / 7, REG_FILE_SPEC.y + REG_FILE_SPEC.h * 4 / 5,
        REG_FILE_SPEC.x, REG_FILE_SPEC.y + REG_FILE_SPEC.h * 4 / 5,

      ], PATH_WIDTH, {endText: " write_data"})
    ]);

    this.children = {
      // Fetch
      halt: halt_reg,
      cause: cause_reg,
      epc: epc_reg,
      pc: pc,
      is_branch_and: is_branch_and,
      pc_mux: pc_mux,
      i_mem: i_mem,
      pc_adder: pc_adder,
      if_id_reg: if_id_reg,
      // Decode
      reg_file: reg_file,
      sign_extend: sign_extend,
      left_shift_2: left_shift_2,
      bt_adder: bt_adder,
      cmp: cmp,
      decode_control: decode_control,

      id_ex_reg: id_ex_reg,
      id_ex_reg_wb: id_ex_reg_wb,
      id_ex_reg_mem: id_ex_reg_mem,
      id_ex_reg_ex: id_ex_reg_ex,

      // Execute
      muldiv: muldiv,
      alu: alu,

      reg_dest_mux: reg_dest_mux,
      alu_op_2_mux: alu_op_2_mux,

      ex_mem_reg: ex_mem_reg,
      ex_mem_reg_wb: ex_mem_reg_wb,
      ex_mem_reg_mem: ex_mem_reg_mem,
      // Memory
      d_mem: dmem,
      mem_wb_reg: mem_wb_reg,
      mem_wb_reg_wb: mem_wb_reg_wb,
      // Writeback
      wb_mux: wb_mux,

    };
  }

  update(sim_state) {
    if (sim_state) {
      this.state = sim_state;
      for (const key in this.children) {
        this.children[key].updateToolTip();
        // Update appearance
      }
    }
  }

  draw() {
    this.drawing.clear();
    for (const key in this.children) {
      this.children[key].draw();
    }
  }
}



export { Simulator as Simulator };
