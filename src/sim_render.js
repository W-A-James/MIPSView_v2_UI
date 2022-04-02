import * as s from "@svgdotjs/svg.js";
import { Component, Connector, SHAPE, PATH_WIDTH } from "./component";

function makeBox(x, y, w, h) {
  return { x: x, y: y, w: w, h: h, rx: x + w, by: y + h, cx: x + w / 2, cy: y + h / 2 };
}

const CONTROL_OUTLINE = "#0000FF";

const REG_WIDTH = 0.03;
const REG_HEIGHT = 0.70;
const REG_Y_POS = 0.12;

const PC_SPEC = makeBox(0.07, 0.3, 0.02, 0.12);

const PC_MUX_SPEC = makeBox(0.03, 0.3, 0.02, 0.075);
const I_MEM_SPEC = makeBox(0.1, 0.3, 0.06, 0.12);
const PC_ADDER_SPEC = makeBox(0.1, 0.15, 0.06, 0.12);
const BRANCH_AND_SPEC = makeBox(0.15, 0.02, REG_WIDTH, 0.06);

const IF_ID_REG_SPEC = makeBox(0.2, REG_Y_POS, REG_WIDTH, REG_HEIGHT);

const ID_EX_REG_SPEC = makeBox(0.475, REG_Y_POS, REG_WIDTH, REG_HEIGHT);
const ID_EX_REG_WB_SPEC = Object.assign(makeBox(0.475, REG_Y_POS, REG_WIDTH, 0.05), { outline: CONTROL_OUTLINE });
const ID_EX_REG_MEM_SPEC = Object.assign(makeBox(0.475, REG_Y_POS + 0.05, REG_WIDTH, 0.05), { outline: CONTROL_OUTLINE });
const ID_EX_REG_EX_SPEC = Object.assign(makeBox(0.475, REG_Y_POS + 0.1, REG_WIDTH, 0.05), { outline: CONTROL_OUTLINE });

const REG_FILE_SPEC = makeBox(0.31, 0.4, REG_WIDTH * 3, REG_WIDTH * 5);
const SIGN_EXT_SPEC = makeBox(0.31, 0.6, REG_WIDTH, REG_WIDTH * 3);

const LEFT_SHIFT_2_SPEC = makeBox(0.31, 0.3, REG_WIDTH, REG_WIDTH * 2.5);
const BRANCH_TARGET_ADDER_SPEC = makeBox(0.35, 0.22, 0.03, 0.075);
const CMP_SPEC = makeBox(0.40, 0.3, REG_WIDTH, 0.05);
const DECODE_CONTROL_SPEC = Object.assign(makeBox(0.35, 0.12, REG_WIDTH, REG_WIDTH * 3), { outline: "#00F" });

const ALU_SPEC = makeBox(0.59, 0.4, 0.05, 0.16);
const MULDIV_SPEC = makeBox(0.59, 0.26, 0.05, 0.12);
const ALU_CONTROL_SPEC = Object.assign(makeBox(0.5875, 0.62, 0.03, 0.08), { outline: "#00F" });
const REG_DEST_MUX_SPEC = makeBox(0.54, 0.69, 0.03, 0.1);
const ALU_OP_2_MUX_SPEC = makeBox(0.53, 0.5, 0.03, 0.07);

const EX_MEM_REG_SPEC = makeBox(0.7, REG_Y_POS, REG_WIDTH, REG_HEIGHT);
const EX_MEM_REG_WB_SPEC = Object.assign(makeBox(0.7, REG_Y_POS, REG_WIDTH, 0.05), { outline: CONTROL_OUTLINE });
const EX_MEM_REG_MEM_SPEC = Object.assign(makeBox(0.7, REG_Y_POS + 0.05, REG_WIDTH, 0.05), { outline: CONTROL_OUTLINE });

const D_MEM_SPEC = makeBox(0.76, 0.45, 0.1, 0.15);
const MEM_WB_REG_SPEC = makeBox(0.88, REG_Y_POS, REG_WIDTH, REG_HEIGHT);
const MEM_WB_REG_WB_SPEC = Object.assign(makeBox(0.88, REG_Y_POS, REG_WIDTH, 0.05), { outline: CONTROL_OUTLINE });
const WB_MUX_SPEC = makeBox(0.94, 0.45, 0.03, 0.1);

class Simulator {
  constructor(target_element) {
    this.target_element = target_element;
    this.drawing = s.SVG().addTo(this.target_element).size("100%", "100%");
    this.state = null;
    this.children = {
      // Fetch
      pc: new Component(this, PC_SPEC, "PC",
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
            ], PATH_WIDTH, _ => { }, { end: true }
          )
        ]
        , console.log, SHAPE.BOX, "reg"),
      is_branch_and: new Component(this, BRANCH_AND_SPEC, "AND", [
        new Connector(this, [
          BRANCH_AND_SPEC.x, BRANCH_AND_SPEC.cy,
          PC_MUX_SPEC.cx, BRANCH_AND_SPEC.cy,
          PC_MUX_SPEC.cx, PC_MUX_SPEC.y,
        ], undefined)], undefined),
      pc_mux: new Component(this, PC_MUX_SPEC, "Mux", [
        new Connector(this,
          [
            PC_MUX_SPEC.rx, PC_MUX_SPEC.cy,
            PC_SPEC.x, PC_MUX_SPEC.y + PC_MUX_SPEC.h / 2
          ]
        )
      ], undefined),
      i_mem: new Component(this, I_MEM_SPEC, "Instruction\nMemory", [
        new Connector(this, [
          I_MEM_SPEC.x + I_MEM_SPEC.w, I_MEM_SPEC.y + I_MEM_SPEC.h / 2,
          IF_ID_REG_SPEC.x, I_MEM_SPEC.y + I_MEM_SPEC.h / 2
        ])
      ], undefined),
      pc_adder: new Component(this, PC_ADDER_SPEC, "Add", [
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
        )
      ], undefined, SHAPE.ARITH),

      if_id_reg: new Component(this, IF_ID_REG_SPEC, "IF/ID", [
        /* Reg read 1 */
        new Connector(this, [
          IF_ID_REG_SPEC.x + IF_ID_REG_SPEC.w, REG_FILE_SPEC.y + REG_FILE_SPEC.h / 5,
          REG_FILE_SPEC.x, REG_FILE_SPEC.y + REG_FILE_SPEC.h / 5
        ], PATH_WIDTH, undefined, { start: false, end: true, endText: "read_1" }
        ),
        /* TODO: Reg read 2*/
        new Connector(this, [
          IF_ID_REG_SPEC.x + IF_ID_REG_SPEC.w, REG_FILE_SPEC.y + REG_FILE_SPEC.h * 2 / 5,
          REG_FILE_SPEC.x, REG_FILE_SPEC.y + REG_FILE_SPEC.h * 2 / 5
        ], PATH_WIDTH, undefined, { start: false, end: true, endText: "read_2" }),
        /* Vertical line holding instruction  */
        new Connector(this, [
          (IF_ID_REG_SPEC.rx + REG_FILE_SPEC.x) / 2, DECODE_CONTROL_SPEC.y + DECODE_CONTROL_SPEC.h / 2,
          (IF_ID_REG_SPEC.rx + REG_FILE_SPEC.x) / 2, SIGN_EXT_SPEC.by + SIGN_EXT_SPEC.h * 2 / 3,
        ]),
        /* To Control */
        new Connector(this, [
          (IF_ID_REG_SPEC.rx + REG_FILE_SPEC.x) / 2, DECODE_CONTROL_SPEC.cy,
          DECODE_CONTROL_SPEC.x, DECODE_CONTROL_SPEC.cy,
        ]),
        /* To Sign Extend */
        new Connector(this, [
          (IF_ID_REG_SPEC.rx + REG_FILE_SPEC.x) / 2, SIGN_EXT_SPEC.cy,
          SIGN_EXT_SPEC.x, SIGN_EXT_SPEC.cy,
        ]),
        /* Instr[20:16] */
        new Connector(this, [
          (IF_ID_REG_SPEC.rx + REG_FILE_SPEC.x) / 2, SIGN_EXT_SPEC.by + SIGN_EXT_SPEC.h / 3,
          ID_EX_REG_SPEC.x, SIGN_EXT_SPEC.by + SIGN_EXT_SPEC.h / 3,
        ]),
        /* Instr[15:11] */
        new Connector(this, [
          (IF_ID_REG_SPEC.rx + REG_FILE_SPEC.x) / 2, SIGN_EXT_SPEC.by + SIGN_EXT_SPEC.h * 2 / 3,
          ID_EX_REG_SPEC.x, SIGN_EXT_SPEC.by + SIGN_EXT_SPEC.h * 2 / 3,
        ]),
        /* PC Plus 4 */
        new Connector(this, [
          IF_ID_REG_SPEC.rx, PC_ADDER_SPEC.cy,
          (IF_ID_REG_SPEC.rx + BRANCH_TARGET_ADDER_SPEC.x) / 2, PC_ADDER_SPEC.cy,
          (IF_ID_REG_SPEC.rx + BRANCH_TARGET_ADDER_SPEC.x) / 2, BRANCH_TARGET_ADDER_SPEC.y + BRANCH_TARGET_ADDER_SPEC.h / 3,
          BRANCH_TARGET_ADDER_SPEC.x, BRANCH_TARGET_ADDER_SPEC.y + BRANCH_TARGET_ADDER_SPEC.h / 3,

        ])
        /* T*/
      ], undefined),

      // Decode
      reg_file: new Component(this, REG_FILE_SPEC, "Reg File", [
        /* Reg data 1*/
        Connector.horizontal(this, REG_FILE_SPEC.rx, ID_EX_REG_SPEC.x, REG_FILE_SPEC.y + REG_FILE_SPEC.h / 5, PATH_WIDTH, undefined, { start: false, end: true, startText: "reg_1" }),
        /* To cmp 1 */
        Connector.vertical(this, REG_FILE_SPEC.y + REG_FILE_SPEC.h / 5, CMP_SPEC.by, CMP_SPEC.x + CMP_SPEC.w / 3, PATH_WIDTH, undefined, { start: true, end: true }),
        /* Reg data 2*/
        Connector.horizontal(this, REG_FILE_SPEC.rx, ID_EX_REG_SPEC.x, REG_FILE_SPEC.y + REG_FILE_SPEC.h * 2 / 5, PATH_WIDTH, undefined, { end: true, startText: "reg_2" }),
        /* To cmp 2 */
        Connector.vertical(this, REG_FILE_SPEC.y + REG_FILE_SPEC.h * 2 / 5, CMP_SPEC.by, CMP_SPEC.x + CMP_SPEC.w * 2 / 3, PATH_WIDTH, undefined, { start: true, end: true }),
      ], undefined),
      sign_extend: new Component(this, SIGN_EXT_SPEC, "Sign\nExtend", [
        Connector.horizontal(this, SIGN_EXT_SPEC.rx, ID_EX_REG_SPEC.x, SIGN_EXT_SPEC.cy),
        new Connector(this, [
          (CMP_SPEC.rx + ID_EX_REG_SPEC.x) / 2, SIGN_EXT_SPEC.cy,
          (CMP_SPEC.rx + ID_EX_REG_SPEC.x) / 2, (REG_FILE_SPEC.y + CMP_SPEC.by) / 2,
          (CMP_SPEC.x + REG_FILE_SPEC.cx) / 2, (REG_FILE_SPEC.y + CMP_SPEC.by) / 2,
          (CMP_SPEC.x + REG_FILE_SPEC.cx) / 2, LEFT_SHIFT_2_SPEC.cy,
          LEFT_SHIFT_2_SPEC.rx, LEFT_SHIFT_2_SPEC.cy,

        ])
      ], undefined, SHAPE.CIRCLE),
      left_shift_2: new Component(this, LEFT_SHIFT_2_SPEC, "<<2", [
        new Connector(this, [
          LEFT_SHIFT_2_SPEC.cx, LEFT_SHIFT_2_SPEC.y,
          LEFT_SHIFT_2_SPEC.cx, BRANCH_TARGET_ADDER_SPEC.y + BRANCH_TARGET_ADDER_SPEC.h * 2 / 3,
          BRANCH_TARGET_ADDER_SPEC.x, BRANCH_TARGET_ADDER_SPEC.y + BRANCH_TARGET_ADDER_SPEC.h * 2 / 3,

        ])
      ], undefined),
      bt_adder: new Component(this, BRANCH_TARGET_ADDER_SPEC, "Add", [
        new Connector(this, [
          BRANCH_TARGET_ADDER_SPEC.rx, BRANCH_TARGET_ADDER_SPEC.cy,
          (BRANCH_TARGET_ADDER_SPEC.rx + ID_EX_REG_SPEC.x) / 2, BRANCH_TARGET_ADDER_SPEC.cy,
          (BRANCH_TARGET_ADDER_SPEC.rx + ID_EX_REG_SPEC.x) / 2, BRANCH_AND_SPEC.y - BRANCH_AND_SPEC.h / 5,
          (PC_MUX_SPEC.x - PC_MUX_SPEC.w * 4 / 3), BRANCH_AND_SPEC.y - BRANCH_AND_SPEC.h / 5,
          (PC_MUX_SPEC.x - PC_MUX_SPEC.w * 4 / 3), PC_MUX_SPEC.y + PC_MUX_SPEC.h * 2 / 3,
          (PC_MUX_SPEC.x), PC_MUX_SPEC.y + PC_MUX_SPEC.h * 2 / 3,
        ]),
      ], undefined, SHAPE.ARITH),
      cmp: new Component(this, CMP_SPEC, "Cmp", [
        new Connector(this, [
          CMP_SPEC.cx, CMP_SPEC.y,
          CMP_SPEC.cx, BRANCH_AND_SPEC.y + BRANCH_AND_SPEC.h * 2 / 3,
          BRANCH_AND_SPEC.rx, BRANCH_AND_SPEC.y + BRANCH_AND_SPEC.h * 2 / 3
        ])
      ]),
      decode_control: new Component(this, DECODE_CONTROL_SPEC, "Control", [
        new Connector(this, [
          DECODE_CONTROL_SPEC.cx, DECODE_CONTROL_SPEC.y,
          DECODE_CONTROL_SPEC.cx, BRANCH_AND_SPEC.y + BRANCH_AND_SPEC.h / 3,
          BRANCH_AND_SPEC.rx, BRANCH_AND_SPEC.y + BRANCH_AND_SPEC.h / 3,
        ],
          PATH_WIDTH,
          undefined,
          { end: true },
          { color: CONTROL_OUTLINE }
        ),
        Connector.horizontal(this, DECODE_CONTROL_SPEC.rx, (DECODE_CONTROL_SPEC.rx + (ID_EX_REG_SPEC.x - DECODE_CONTROL_SPEC.rx) * (4 / 5)), DECODE_CONTROL_SPEC.cy, PATH_WIDTH, undefined, { start: false, end: false }, { color: CONTROL_OUTLINE }),
        Connector.vertical(this, ID_EX_REG_WB_SPEC.cy, ID_EX_REG_EX_SPEC.cy, (DECODE_CONTROL_SPEC.rx + (ID_EX_REG_SPEC.x - DECODE_CONTROL_SPEC.rx) * (4 / 5)), PATH_WIDTH, undefined, { start: false, end: false }, { color: CONTROL_OUTLINE }),
        Connector.horizontal(this, (DECODE_CONTROL_SPEC.rx + (ID_EX_REG_SPEC.x - DECODE_CONTROL_SPEC.rx) * (4 / 5)), ID_EX_REG_WB_SPEC.x, ID_EX_REG_WB_SPEC.cy, PATH_WIDTH, undefined, { start: false, end: true }, { color: CONTROL_OUTLINE }),
        Connector.horizontal(this, (DECODE_CONTROL_SPEC.rx + (ID_EX_REG_SPEC.x - DECODE_CONTROL_SPEC.rx) * (4 / 5)), ID_EX_REG_MEM_SPEC.x, ID_EX_REG_MEM_SPEC.cy, PATH_WIDTH, undefined, { start: true, end: true }, { color: CONTROL_OUTLINE }),
        Connector.horizontal(this, (DECODE_CONTROL_SPEC.rx + (ID_EX_REG_SPEC.x - DECODE_CONTROL_SPEC.rx) * (4 / 5)), ID_EX_REG_EX_SPEC.x, ID_EX_REG_EX_SPEC.cy, PATH_WIDTH, undefined, { start: false, end: true }, { color: CONTROL_OUTLINE })
      ], undefined, SHAPE.CIRCLE, "control"),

      id_ex_reg: new Component(this, ID_EX_REG_SPEC, "ID/EX", [
        Connector.horizontal(this, ID_EX_REG_SPEC.rx, REG_DEST_MUX_SPEC.x, SIGN_EXT_SPEC.by + SIGN_EXT_SPEC.h / 3),
        Connector.horizontal(this, ID_EX_REG_SPEC.rx, REG_DEST_MUX_SPEC.x, SIGN_EXT_SPEC.by + SIGN_EXT_SPEC.h * 2 / 3),
        Connector.horizontal(this, ID_EX_REG_SPEC.rx, ALU_SPEC.x, REG_FILE_SPEC.y + REG_FILE_SPEC.h / 5),
        new Connector(this, [
          ID_EX_REG_SPEC.rx, SIGN_EXT_SPEC.cy,
          (ID_EX_REG_SPEC.rx + ALU_CONTROL_SPEC.x) / 2, SIGN_EXT_SPEC.cy,
          (ID_EX_REG_SPEC.rx + ALU_CONTROL_SPEC.x) / 2, ALU_CONTROL_SPEC.cy,
          ALU_CONTROL_SPEC.x, ALU_CONTROL_SPEC.cy,
        ]),
        new Connector(this, [
          (ID_EX_REG_SPEC.rx + (ALU_OP_2_MUX_SPEC.x - ID_EX_REG_SPEC.rx) / 3), SIGN_EXT_SPEC.cy,
          (ID_EX_REG_SPEC.rx + (ALU_OP_2_MUX_SPEC.x - ID_EX_REG_SPEC.rx) / 3), ALU_OP_2_MUX_SPEC.y + ALU_OP_2_MUX_SPEC.h * 2 / 3,
          ALU_OP_2_MUX_SPEC.x, ALU_OP_2_MUX_SPEC.y + ALU_OP_2_MUX_SPEC.h * 2 / 3,
        ], PATH_WIDTH, undefined, { start: true, end: true }),
        new Connector(this, [
          ID_EX_REG_SPEC.rx, REG_FILE_SPEC.y + REG_FILE_SPEC.h * 2 / 5,
          ID_EX_REG_SPEC.rx + (ALU_OP_2_MUX_SPEC.x - ID_EX_REG_SPEC.rx) / 3, REG_FILE_SPEC.y + REG_FILE_SPEC.h * 2 / 5,
          ID_EX_REG_SPEC.rx + (ALU_OP_2_MUX_SPEC.x - ID_EX_REG_SPEC.rx) / 3, ALU_OP_2_MUX_SPEC.y + ALU_OP_2_MUX_SPEC.h / 3,
          ALU_OP_2_MUX_SPEC.x, ALU_OP_2_MUX_SPEC.y + ALU_OP_2_MUX_SPEC.h / 3,
        ]),
        new Connector(this, [
          ID_EX_REG_SPEC.rx + (ALU_OP_2_MUX_SPEC.x - ID_EX_REG_SPEC.rx) * 2 / 3, ALU_OP_2_MUX_SPEC.y + ALU_OP_2_MUX_SPEC.h / 3,
          ID_EX_REG_SPEC.rx + (ALU_OP_2_MUX_SPEC.x - ID_EX_REG_SPEC.rx) * 2 / 3, D_MEM_SPEC.by - D_MEM_SPEC.h / 7,
          EX_MEM_REG_SPEC.x, D_MEM_SPEC.by - D_MEM_SPEC.h / 7,
        ], PATH_WIDTH, undefined, { start: true, end: true })
      ], (_e) => {
        console.log(this.state.id_ex_reg.current_map);
      }),

      id_ex_reg_wb: new Component(this, ID_EX_REG_WB_SPEC, "", [
        Connector.horizontal(this, ID_EX_REG_WB_SPEC.rx, EX_MEM_REG_SPEC.x, ID_EX_REG_WB_SPEC.cy, PATH_WIDTH, undefined, {}, { color: CONTROL_OUTLINE })
      ], undefined),
      id_ex_reg_mem: new Component(this, ID_EX_REG_MEM_SPEC, "", [
        Connector.horizontal(this, ID_EX_REG_MEM_SPEC.rx, EX_MEM_REG_SPEC.x, ID_EX_REG_MEM_SPEC.cy, PATH_WIDTH, undefined, {}, { color: CONTROL_OUTLINE })
      ], undefined),
      id_ex_reg_ex: new Component(this, ID_EX_REG_EX_SPEC, "", [
        new Connector(this, [
          ID_EX_REG_EX_SPEC.rx, ID_EX_REG_EX_SPEC.y + ID_EX_REG_EX_SPEC.h * 3 / 4,
          ALU_OP_2_MUX_SPEC.cx, ID_EX_REG_EX_SPEC.y + ID_EX_REG_EX_SPEC.h * 3 / 4,
          ALU_OP_2_MUX_SPEC.cx, ALU_OP_2_MUX_SPEC.y,
        ], PATH_WIDTH, undefined, {}, { color: CONTROL_OUTLINE }),
        new Connector(this, [
          ID_EX_REG_EX_SPEC.rx, ID_EX_REG_EX_SPEC.y + ID_EX_REG_EX_SPEC.h / 4,
          ALU_SPEC.rx + (EX_MEM_REG_SPEC.x - ALU_SPEC.rx) / 3, ID_EX_REG_EX_SPEC.y + ID_EX_REG_EX_SPEC.h / 4,
          ALU_SPEC.rx + (EX_MEM_REG_SPEC.x - ALU_SPEC.rx) / 3, REG_DEST_MUX_SPEC.by + REG_DEST_MUX_SPEC.h / 4,
          REG_DEST_MUX_SPEC.cx, REG_DEST_MUX_SPEC.by + REG_DEST_MUX_SPEC.h / 4,
          REG_DEST_MUX_SPEC.cx, REG_DEST_MUX_SPEC.by,

        ], PATH_WIDTH, undefined, {}, { color: CONTROL_OUTLINE }),
        new Connector(this, [
          ID_EX_REG_EX_SPEC.rx, ID_EX_REG_EX_SPEC.y + ID_EX_REG_EX_SPEC.h * 1 / 2,
          ALU_SPEC.rx + (EX_MEM_REG_SPEC.x - ALU_SPEC.rx) * 2 / 3, ID_EX_REG_EX_SPEC.y + ID_EX_REG_EX_SPEC.h * 1 / 2,
          ALU_SPEC.rx + (EX_MEM_REG_SPEC.x - ALU_SPEC.rx) * 2 / 3, ALU_CONTROL_SPEC.by + ALU_CONTROL_SPEC.h / 4,
          ALU_CONTROL_SPEC.cx, ALU_CONTROL_SPEC.by + ALU_CONTROL_SPEC.h / 4,
          ALU_CONTROL_SPEC.cx, ALU_CONTROL_SPEC.by,

        ], PATH_WIDTH, undefined, {}, { color: CONTROL_OUTLINE })
      ], undefined),

      // Execute
      muldiv: new Component(this, MULDIV_SPEC, "MULDIV", [], undefined, SHAPE.BOX),
      alu: new Component(this, ALU_SPEC, "ALU", [
        Connector.horizontal(this, ALU_SPEC.rx, EX_MEM_REG_SPEC.x, ALU_SPEC.cy)
      ], undefined, SHAPE.ARITH),
      alu_control: new Component(this, ALU_CONTROL_SPEC, "ALU\nControl", [
        new Connector(this, [
          ALU_CONTROL_SPEC.rx, ALU_CONTROL_SPEC.cy,
          (ALU_CONTROL_SPEC.rx + ALU_SPEC.rx) / 2, ALU_CONTROL_SPEC.cy,
          (ALU_CONTROL_SPEC.rx + ALU_SPEC.rx) / 2, ALU_SPEC.by * 0.92,
        ], PATH_WIDTH, undefined, {}, { color: CONTROL_OUTLINE })
      ], undefined, SHAPE.CIRCLE),
      reg_dest_mux: new Component(this, REG_DEST_MUX_SPEC, "Mux", [
        Connector.horizontal(this, REG_DEST_MUX_SPEC.rx, EX_MEM_REG_SPEC.x, REG_DEST_MUX_SPEC.cy)
      ], undefined),
      alu_op_2_mux: new Component(this, ALU_OP_2_MUX_SPEC, "Mux", [
        Connector.horizontal(this, ALU_OP_2_MUX_SPEC.rx, ALU_SPEC.x, ALU_OP_2_MUX_SPEC.cy)
      ], undefined),

      ex_mem_reg: new Component(this, EX_MEM_REG_SPEC, "EX/MEM", [
        Connector.horizontal(this, EX_MEM_REG_SPEC.rx, D_MEM_SPEC.x, ALU_SPEC.cy, PATH_WIDTH, undefined, { start: false, end: true, endText: "addr" }),
        new Connector(this, [
          (EX_MEM_REG_SPEC.rx + D_MEM_SPEC.x) / 2, ALU_SPEC.cy,
          (EX_MEM_REG_SPEC.rx + D_MEM_SPEC.x) / 2, D_MEM_SPEC.by + D_MEM_SPEC.h / 4,
          MEM_WB_REG_SPEC.x, D_MEM_SPEC.by + D_MEM_SPEC.h / 4,
        ], PATH_WIDTH, undefined, { start: true, end: true }),
        Connector.horizontal(this, EX_MEM_REG_SPEC.rx, MEM_WB_REG_SPEC.x, REG_DEST_MUX_SPEC.cy, PATH_WIDTH),
        Connector.horizontal(this, EX_MEM_REG_SPEC.rx, D_MEM_SPEC.x, D_MEM_SPEC.by - D_MEM_SPEC.h / 7)
      ], undefined, { endText: "w_data" }),
      ex_mem_reg_wb: new Component(this, EX_MEM_REG_WB_SPEC, "", [
        Connector.horizontal(this, EX_MEM_REG_WB_SPEC.rx, MEM_WB_REG_WB_SPEC.x, EX_MEM_REG_WB_SPEC.cy, PATH_WIDTH, undefined, { start: false, end: true }, { color: CONTROL_OUTLINE })
      ], undefined),
      ex_mem_reg_mem: new Component(this, EX_MEM_REG_MEM_SPEC, "", [
        new Connector(this, [
          EX_MEM_REG_MEM_SPEC.rx, EX_MEM_REG_MEM_SPEC.y + EX_MEM_REG_MEM_SPEC.h / 3,
          D_MEM_SPEC.cx, EX_MEM_REG_MEM_SPEC.y + EX_MEM_REG_MEM_SPEC.h / 3,
          D_MEM_SPEC.cx, D_MEM_SPEC.y
        ], PATH_WIDTH, undefined, {}, { color: CONTROL_OUTLINE }),
        new Connector(this, [
          EX_MEM_REG_MEM_SPEC.rx, EX_MEM_REG_MEM_SPEC.y + EX_MEM_REG_MEM_SPEC.h * 2 / 3,
          EX_MEM_REG_MEM_SPEC.rx + (D_MEM_SPEC.x - EX_MEM_REG_MEM_SPEC.rx) / 4, EX_MEM_REG_MEM_SPEC.y + EX_MEM_REG_MEM_SPEC.h * 2 / 3,
          EX_MEM_REG_MEM_SPEC.rx + (D_MEM_SPEC.x - EX_MEM_REG_MEM_SPEC.rx) / 4, D_MEM_SPEC.by + D_MEM_SPEC.h * 1 / 3,
          D_MEM_SPEC.cx, D_MEM_SPEC.by + D_MEM_SPEC.h * 1 / 3,
          D_MEM_SPEC.cx, D_MEM_SPEC.by,
        ], PATH_WIDTH, undefined, {}, { color: CONTROL_OUTLINE }),

      ], undefined),
      // Memory
      d_mem: new Component(this, D_MEM_SPEC, "Data\nMemory", [
        Connector.horizontal(this, D_MEM_SPEC.rx, MEM_WB_REG_SPEC.x, ALU_SPEC.cy, PATH_WIDTH, undefined, { start: false, end: true })
      ], undefined),
      mem_wb_reg: new Component(this, MEM_WB_REG_SPEC, "MEM/WB", [
        Connector.horizontal(this, MEM_WB_REG_SPEC.rx, WB_MUX_SPEC.x, ALU_SPEC.cy, PATH_WIDTH, undefined, { start: false, end: true }),
        new Connector(this, [
          MEM_WB_REG_SPEC.rx, D_MEM_SPEC.by + D_MEM_SPEC.h / 4,
          (MEM_WB_REG_SPEC.rx + WB_MUX_SPEC.x) / 2, D_MEM_SPEC.by + D_MEM_SPEC.h / 4,
          (MEM_WB_REG_SPEC.rx + WB_MUX_SPEC.x) / 2, WB_MUX_SPEC.y + WB_MUX_SPEC.h * 2 / 3,
          WB_MUX_SPEC.x, WB_MUX_SPEC.y + WB_MUX_SPEC.h * 2 / 3,
        ], PATH_WIDTH, undefined, { start: false, end: true }),
        new Connector(this, [
          MEM_WB_REG_SPEC.rx, REG_DEST_MUX_SPEC.cy,
          (MEM_WB_REG_SPEC.rx + WB_MUX_SPEC.x) / 2, REG_DEST_MUX_SPEC.cy,
          (MEM_WB_REG_SPEC.rx + WB_MUX_SPEC.x) / 2, MEM_WB_REG_SPEC.by + MEM_WB_REG_SPEC.h / 12,
          (IF_ID_REG_SPEC.rx + (REG_FILE_SPEC.x - IF_ID_REG_SPEC.rx) * 3 / 4), MEM_WB_REG_SPEC.by + MEM_WB_REG_SPEC.h / 12,
          (IF_ID_REG_SPEC.rx + (REG_FILE_SPEC.x - IF_ID_REG_SPEC.rx) * 3 / 4), REG_FILE_SPEC.y + REG_FILE_SPEC.h * 3 / 5,
          REG_FILE_SPEC.x, REG_FILE_SPEC.y + REG_FILE_SPEC.h * 3 / 5


        ], PATH_WIDTH, undefined, { start: false, end: true })
      ], undefined),
      mem_wb_reg_wb: new Component(this, MEM_WB_REG_WB_SPEC, "", [
        new Connector(this, [
          MEM_WB_REG_WB_SPEC.rx, MEM_WB_REG_WB_SPEC.y + MEM_WB_REG_WB_SPEC.h * 2 / 3,
          WB_MUX_SPEC.cx, MEM_WB_REG_WB_SPEC.y + MEM_WB_REG_WB_SPEC.h * 2 / 3,
          WB_MUX_SPEC.cx, WB_MUX_SPEC.y
        ], PATH_WIDTH, undefined, { start: false, end: true }, { color: CONTROL_OUTLINE }),
        new Connector(this, [
          MEM_WB_REG_WB_SPEC.rx, MEM_WB_REG_WB_SPEC.y + MEM_WB_REG_WB_SPEC.h / 3,
          WB_MUX_SPEC.rx + (1.0 - WB_MUX_SPEC.rx) * 2 / 3, MEM_WB_REG_WB_SPEC.y + MEM_WB_REG_WB_SPEC.h / 3,
          WB_MUX_SPEC.rx + (1.0 - WB_MUX_SPEC.rx) * 2 / 3, MEM_WB_REG_SPEC.by + (1.0 - MEM_WB_REG_SPEC.by) * 2 / 3,
          REG_FILE_SPEC.cx, MEM_WB_REG_SPEC.by + (1.0 - MEM_WB_REG_SPEC.by) * 2 / 3,
          REG_FILE_SPEC.cx, REG_FILE_SPEC.by

        ], PATH_WIDTH, undefined, {}, { color: CONTROL_OUTLINE })
      ], undefined),
      // Writeback
      wb_mux: new Component(this, WB_MUX_SPEC, "Mux", [
        new Connector(this, [
          WB_MUX_SPEC.rx, WB_MUX_SPEC.cy,
          WB_MUX_SPEC.rx + (1.0 - WB_MUX_SPEC.rx) / 3, WB_MUX_SPEC.cy,
          WB_MUX_SPEC.rx + (1.0 - WB_MUX_SPEC.rx) / 3, MEM_WB_REG_SPEC.by + (MEM_WB_REG_SPEC.h / 8),
          IF_ID_REG_SPEC.rx + (REG_FILE_SPEC.x - IF_ID_REG_SPEC.rx) * 6 / 7, MEM_WB_REG_SPEC.by + (MEM_WB_REG_SPEC.h / 8),
          IF_ID_REG_SPEC.rx + (REG_FILE_SPEC.x - IF_ID_REG_SPEC.rx) * 6 / 7, REG_FILE_SPEC.y + REG_FILE_SPEC.h * 4 / 5,
          REG_FILE_SPEC.x, REG_FILE_SPEC.y + REG_FILE_SPEC.h * 4 / 5,

        ])
      ], undefined),

    };
  }

  update(sim_state) {
    if (sim_state) this.state = sim_state;
  }

  draw() {
    this.drawing.clear();
    for (const key in this.children) {
      this.children[key].draw();
    }
  }
}



export { Simulator as Simulator };
