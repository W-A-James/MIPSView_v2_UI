import * as s from "@svgdotjs/svg.js";

// TODO: Pick colours for control and data path signals
// TODO: Pick widths for datapath connections and control connections
// TODO: Add different shapes to allow for eg: ovals, etc
let CONTROL_OUTLINE = "#f00";
let CONTROL_FILL = "#FFF";

let DATA_PATH_OUTLINE = "#000";
let DATA_PATH_FILL = "#FFF";



class Connector {
    constructor(owner, path, weight, onclick) {
        this.owner = owner;
        this.path = path;
        this.line_weight = weight;
        this.colour = "#000";
        this.onclick = onclick;
    }

    static horizontal(owner, startX, endX, y, weight, onclick) {
        let rv = new Connector(owner, [startX, y, endX, y], weight, onclick);
        console.log(rv);
        return rv;
    }

    static vertical(owner, startY, endY, x, weight, onclick) {
        return new Connector(owner, [x, startY, x, endY], weight, onclick);
    }

    draw() {
        let frame = document.getElementById(this.owner.target_element.substr(1));
        let drawing_width = frame.clientWidth;
        let drawing_height = frame.clientHeight;

        console.log("drawing connector");
        let i = 0;
        let new_path = this.path.map(e => {
            let rv;
            if (i % 2 === 0) {
                rv = e * drawing_width;
            }
            else {
                rv = e * drawing_height;
            }
            i += 1;
            return rv;
        });

        // TODO: Add Markers
        // TODO: Add Labels
        this.owner.drawing.polyline(new_path)
            .stroke(
                {
                    width: this.line_weight,
                    color: this.colour,
                }
            )
            .fill('none')
            .on("click", this.onclick === undefined ? () => {} : this.onclick);
    }
}

const SHAPE = {
    CIRCLE: "CIRCLE",
    BOX: "BOX",
    ARITH: "ARITH"
};
class Component {
    constructor(owner, spec, name, connectors, onclick, shape) {
        this.owner = owner;
        this.x = spec.x;
        this.y = spec.y;
        this.width = spec.w;
        this.height = spec.h;
        this.name = name;
        this.fill = "#FFF";
        this.outline = "#000";
        this.rect = null;
        this.shape = shape;
        this.connectors = connectors;
        this.onclick = onclick;
    }

    convertRelativeToPixels(relativeX, relativeY) {
        let frame = document.getElementById(this.owner.target_element.substr(1));
        let drawing_width = frame.clientWidth;
        let drawing_height = frame.clientHeight;

        return {
            x: relativeX > 1 ? relativeX : relativeX * drawing_width,
            y: relativeY > 1 ? relativeY : relativeY * drawing_height
        };
    }

    setFill(fill) {
        this.fill = fill;
    }

    setOutline(outline) {
        this.outline = outline;
    }

    get_arith_pts(x, y, w, h, lambda, phi) {
        let l= lambda * w;
        let p= phi * h;

        return [
            x, y,
            x + w, y + ((h - p) / 2),
            x + w, y + ((h - p) / 2) + p,
            x, y + h,
            x, y + h - ((h - p) / 2),
            x + l, y + (h / 2),
            x, y + ((h - p) / 2)
        ];
    }

    draw() {
        let loc = this.convertRelativeToPixels(this.x, this.y);
        let size = this.convertRelativeToPixels(this.width, this.height);
        // TODO: Check Shape here
        switch (this.shape) {
            case SHAPE.ARITH:
                let pts = this.get_arith_pts(loc.x, loc.y, size.x, size.y, 0.3, 0.25);
                this.rect = this.owner.drawing.polygon(pts)
                    .attr(
                        {
                            'fill-opacity': 0.0,
                            'stroke-opacity': 1.0
                        }
                    )
                    .fill(this.fill)
                    .stroke(this.outline)
                    .on('click', this.onclick === undefined ? () => {} : this.onclick);
                break;
            case SHAPE.CIRCLE:
                this.rect = this.owner.drawing.ellipse(size.x, size.y)
                    .attr({
                        'fill-opacity': 0.0,
                        'stroke-opacity': 1.0
                    })
                    .x(loc.x)
                    .y(loc.y)
                    .fill(this.fill)
                    .stroke(this.outline)
                    .on('click', this.onclick === undefined ? () => {} : this.onclick);
                break;
            default:
                this.rect = this.owner.drawing.rect(size.x, size.y)
                    .attr({
                        'fill-opacity': 0.0,
                        'stroke-opacity': 1.0
                    })
                    .x(loc.x)
                    .y(loc.y)
                    .fill(this.fill)
                    .stroke(this.outline)
                    .on('click', this.onclick === undefined ? () => {} : this.onclick);
        }
        // Calculate center and draw text at center
        let center = {
            x: loc.x + size.x / 2,
            y: loc.y + size.y / 2
        };
        // draw text
        // TODO: center label
        this.text = this.owner.drawing
            .text(this.name)
            .x(center.x)
            .y(center.y)
            .width(size.x)
            .height(size.y);

        this.connectors.forEach(c => c.draw());
    }
}

function makeBox(x, y, w, h) {
    return {x: x, y: y, w: w, h: h, rx: x + w, by: y + h, cx: x + w / 2, cy: y + h / 2};
}

const REG_WIDTH = 0.03;
const REG_HEIGHT = 0.70;
const REG_Y_POS = 0.12;
const PATH_WIDTH = 2;

const PC_COORDS = makeBox(0.07, 0.3, 0.02, 0.12);

const PC_MUX_COORDS = makeBox(0.03, 0.3, 0.02, 0.075);
const I_MEM_COORDS = makeBox(0.1, 0.3, 0.06, 0.12);
const PC_ADDER_COORDS = makeBox(0.1, 0.15, 0.06, 0.12);
const BRANCH_AND_COORDS = makeBox(0.15, 0.02, REG_WIDTH, 0.06);

const IF_ID_REG_COORDS = makeBox(0.2, REG_Y_POS, REG_WIDTH, REG_HEIGHT);

const ID_EX_REG_COORDS = makeBox(0.475, REG_Y_POS, REG_WIDTH, REG_HEIGHT);
const ID_EX_REG_WB_COORDS = makeBox(0.475, REG_Y_POS, REG_WIDTH, 0.05);
const ID_EX_REG_MEM_COORDS = makeBox(0.475, REG_Y_POS + 0.05, REG_WIDTH, 0.05);
const ID_EX_REG_EX_COORDS = makeBox(0.475, REG_Y_POS + 0.1, REG_WIDTH, 0.05);

const REG_FILE_COORDS = makeBox(0.31, 0.4, REG_WIDTH * 3, REG_WIDTH * 5);
const SIGN_EXT_COORDS = makeBox(0.31, 0.6, REG_WIDTH * 1.5, REG_WIDTH * 3);

const LEFT_SHIFT_2_COORDS = makeBox(0.31, 0.3, REG_WIDTH, REG_WIDTH * 2.5);
const BRANCH_TARGET_ADDER_COORDS = makeBox(0.35, 0.22, 0.03, 0.075);
const CMP_COORDS = makeBox(0.40, 0.32, REG_WIDTH, REG_WIDTH);
const DECODE_CONTROL_COORDS = makeBox(0.35, 0.12, REG_WIDTH, REG_WIDTH * 3);

const ALU_COORDS = makeBox(0.59, 0.4, 0.05, 0.16);
const ALU_CONTROL_COORDS = makeBox(0.5875, 0.575, 0.03, 0.08);
const REG_DEST_MUX_COORDS = makeBox(0.54, 0.69, 0.03, 0.1);
const ALU_OP_2_MUX_COORDS = makeBox(0.53, 0.5, 0.03, 0.07);

const EX_MEM_REG_COORDS = makeBox(0.7, REG_Y_POS, REG_WIDTH, REG_HEIGHT);
const EX_MEM_REG_WB_COORDS = makeBox(0.7, REG_Y_POS, REG_WIDTH, 0.05);
const EX_MEM_REG_MEM_COORDS = makeBox(0.7, REG_Y_POS + 0.05, REG_WIDTH, 0.05);

const D_MEM_COORDS = makeBox(0.76, 0.5, 0.1, 0.12);
const MEM_WB_REG_COORDS = makeBox(0.9, REG_Y_POS, REG_WIDTH, REG_HEIGHT);
const WB_MUX_COORDS = makeBox(0.94, 0.5, 0.03, 0.1);

class Simulator {
    constructor(target_element) {
        this.target_element = target_element;
        this.drawing = s.SVG().addTo(this.target_element).size("100%", "100%");
        this.state = null;
        this.children = {
            // Fetch
            pc: new Component(this, PC_COORDS, "PC",
                [
                    new Connector(this,
                        [
                            PC_COORDS.x + PC_COORDS.w, PC_COORDS.y + PC_COORDS.h / 2,
                            I_MEM_COORDS.x, PC_COORDS.y + PC_COORDS.h / 2
                        ],
                        PATH_WIDTH),
                    new Connector(this,
                        [
                            PC_COORDS.x + PC_COORDS.w + 0.005, PC_COORDS.y + PC_COORDS.h / 2,
                            PC_COORDS.x + PC_COORDS.w + 0.005, PC_ADDER_COORDS.y,
                            PC_ADDER_COORDS.x, PC_ADDER_COORDS.y
                        ], PATH_WIDTH
                    )
                ]
                , undefined),
            is_branch_and: new Component(this, BRANCH_AND_COORDS, "AND", [
                new Connector(this, [
                    BRANCH_AND_COORDS.x, BRANCH_AND_COORDS.cy,
                    PC_MUX_COORDS.cx, BRANCH_AND_COORDS.cy,
                    PC_MUX_COORDS.cx, PC_MUX_COORDS.y,
                ], undefined)], undefined),
            pc_mux: new Component(this, PC_MUX_COORDS, "Mux", [
                new Connector(this,
                    [
                        PC_MUX_COORDS.rx, PC_MUX_COORDS.cy,
                        PC_COORDS.x, PC_MUX_COORDS.y + PC_MUX_COORDS.h / 2
                    ]
                )
            ], undefined),
            i_mem: new Component(this, I_MEM_COORDS, "Instruction Memory", [
                new Connector(this, [
                    I_MEM_COORDS.x + I_MEM_COORDS.w, I_MEM_COORDS.y + I_MEM_COORDS.h / 2,
                    IF_ID_REG_COORDS.x, I_MEM_COORDS.y + I_MEM_COORDS.h / 2
                ])
            ], undefined),
            pc_adder: new Component(this, PC_ADDER_COORDS, "Add", [
                /* Adder to IF_ID_REG */
                new Connector(this,
                    [
                        PC_ADDER_COORDS.x + PC_ADDER_COORDS.w, PC_ADDER_COORDS.y + PC_ADDER_COORDS.h / 2,
                        IF_ID_REG_COORDS.x, PC_ADDER_COORDS.y + PC_ADDER_COORDS.h / 2
                    ]),
                /* Adder to PC mux */
                new Connector(this,
                    [
                        (PC_ADDER_COORDS.x + PC_ADDER_COORDS.w + IF_ID_REG_COORDS.x) / 2, PC_ADDER_COORDS.y + PC_ADDER_COORDS.h / 2,
                        (PC_ADDER_COORDS.x + PC_ADDER_COORDS.w + IF_ID_REG_COORDS.x) / 2, PC_ADDER_COORDS.y - PC_ADDER_COORDS.h / 2,
                        (PC_MUX_COORDS.x - PC_MUX_COORDS.w / 2), PC_ADDER_COORDS.y - PC_ADDER_COORDS.h / 2,
                        (PC_MUX_COORDS.x - PC_MUX_COORDS.w / 2), PC_MUX_COORDS.y + PC_MUX_COORDS.h / 4,
                        PC_MUX_COORDS.x, PC_MUX_COORDS.y + PC_MUX_COORDS.h / 4,
                    ]
                )
            ], undefined, SHAPE.ARITH),

            if_id_reg: new Component(this, IF_ID_REG_COORDS, "IF/ID", [
                /* Reg read 1 */
                new Connector(this, [
                    IF_ID_REG_COORDS.x + IF_ID_REG_COORDS.w, REG_FILE_COORDS.y + REG_FILE_COORDS.h / 5,
                    REG_FILE_COORDS.x, REG_FILE_COORDS.y + REG_FILE_COORDS.h / 5
                ]),
                /* TODO: Reg read 2*/
                new Connector(this, [
                    IF_ID_REG_COORDS.x + IF_ID_REG_COORDS.w, REG_FILE_COORDS.y + REG_FILE_COORDS.h * 2 / 5,
                    REG_FILE_COORDS.x, REG_FILE_COORDS.y + REG_FILE_COORDS.h * 2 / 5
                ]),
                /* Vertical line holding instruction  */
                new Connector(this, [
                    (IF_ID_REG_COORDS.rx + REG_FILE_COORDS.x) / 2, DECODE_CONTROL_COORDS.y + DECODE_CONTROL_COORDS.h / 2,
                    (IF_ID_REG_COORDS.rx + REG_FILE_COORDS.x) / 2, SIGN_EXT_COORDS.by + SIGN_EXT_COORDS.h * 2 / 3,
                ]),
                /* To Control */
                new Connector(this, [
                    (IF_ID_REG_COORDS.rx + REG_FILE_COORDS.x) / 2, DECODE_CONTROL_COORDS.cy,
                    DECODE_CONTROL_COORDS.x, DECODE_CONTROL_COORDS.cy,
                ]),
                /* To Sign Extend */
                new Connector(this, [
                    (IF_ID_REG_COORDS.rx + REG_FILE_COORDS.x) / 2, SIGN_EXT_COORDS.cy,
                    SIGN_EXT_COORDS.x, SIGN_EXT_COORDS.cy,
                ]),
                /* Instr[20:16] */
                new Connector(this, [
                    (IF_ID_REG_COORDS.rx + REG_FILE_COORDS.x) / 2, SIGN_EXT_COORDS.by + SIGN_EXT_COORDS.h / 3,
                    ID_EX_REG_COORDS.x, SIGN_EXT_COORDS.by + SIGN_EXT_COORDS.h / 3,
                ]),
                /* Instr[15:11] */
                new Connector(this, [
                    (IF_ID_REG_COORDS.rx + REG_FILE_COORDS.x) / 2, SIGN_EXT_COORDS.by + SIGN_EXT_COORDS.h * 2 / 3,
                    ID_EX_REG_COORDS.x, SIGN_EXT_COORDS.by + SIGN_EXT_COORDS.h * 2 / 3,
                ]),
                /* PC Plus 4 */
                new Connector(this, [
                    IF_ID_REG_COORDS.rx, PC_ADDER_COORDS.cy,
                    (IF_ID_REG_COORDS.rx + BRANCH_TARGET_ADDER_COORDS.x) / 2, PC_ADDER_COORDS.cy,
                    (IF_ID_REG_COORDS.rx + BRANCH_TARGET_ADDER_COORDS.x) / 2, BRANCH_TARGET_ADDER_COORDS.y + BRANCH_TARGET_ADDER_COORDS.h / 3,
                    BRANCH_TARGET_ADDER_COORDS.x, BRANCH_TARGET_ADDER_COORDS.y + BRANCH_TARGET_ADDER_COORDS.h / 3,

                ])
                /* T*/
            ], undefined),

            // Decode
            reg_file: new Component(this, REG_FILE_COORDS, "Reg File", [
                /* Reg data 1*/
                Connector.horizontal(this, REG_FILE_COORDS.rx, ID_EX_REG_COORDS.x, REG_FILE_COORDS.y + REG_FILE_COORDS.h / 5, 1, undefined),
                /* To cmp 1 */
                Connector.vertical(this, REG_FILE_COORDS.y + REG_FILE_COORDS.h / 5, CMP_COORDS.by, CMP_COORDS.x + CMP_COORDS.w / 3),
                /* Reg data 2*/
                Connector.horizontal(this, REG_FILE_COORDS.rx, ID_EX_REG_COORDS.x, REG_FILE_COORDS.y + REG_FILE_COORDS.h * 2 / 5),
                /* To cmp 2 */
                Connector.vertical(this, REG_FILE_COORDS.y + REG_FILE_COORDS.h * 2 / 5, CMP_COORDS.by, CMP_COORDS.x + CMP_COORDS.w * 2 / 3),
            ], undefined),
            sign_extend: new Component(this, SIGN_EXT_COORDS, "Sign Extend", [
                Connector.horizontal(this, SIGN_EXT_COORDS.rx, ID_EX_REG_COORDS.x, SIGN_EXT_COORDS.cy),
                new Connector(this, [
                    (CMP_COORDS.rx + ID_EX_REG_COORDS.x) / 2, SIGN_EXT_COORDS.cy,
                    (CMP_COORDS.rx + ID_EX_REG_COORDS.x) / 2, (REG_FILE_COORDS.y + CMP_COORDS.by) / 2,
                    (CMP_COORDS.x + REG_FILE_COORDS.cx) / 2, (REG_FILE_COORDS.y + CMP_COORDS.by) / 2,
                    (CMP_COORDS.x + REG_FILE_COORDS.cx) / 2, LEFT_SHIFT_2_COORDS.cy,
                    LEFT_SHIFT_2_COORDS.rx, LEFT_SHIFT_2_COORDS.cy,

                ])
            ], undefined, SHAPE.CIRCLE),
            left_shift_2: new Component(this, LEFT_SHIFT_2_COORDS, "<<2", [
                new Connector(this, [
                    LEFT_SHIFT_2_COORDS.cx, LEFT_SHIFT_2_COORDS.y,
                    LEFT_SHIFT_2_COORDS.cx, BRANCH_TARGET_ADDER_COORDS.y + BRANCH_TARGET_ADDER_COORDS.h * 2 / 3,
                    BRANCH_TARGET_ADDER_COORDS.x, BRANCH_TARGET_ADDER_COORDS.y + BRANCH_TARGET_ADDER_COORDS.h * 2 / 3,

                ])
            ], undefined),
            bt_adder: new Component(this, BRANCH_TARGET_ADDER_COORDS, "Add", [
                new Connector(this, [
                    BRANCH_TARGET_ADDER_COORDS.rx, BRANCH_TARGET_ADDER_COORDS.cy,
                    (BRANCH_TARGET_ADDER_COORDS.rx + ID_EX_REG_COORDS.x) / 2, BRANCH_TARGET_ADDER_COORDS.cy,
                    (BRANCH_TARGET_ADDER_COORDS.rx + ID_EX_REG_COORDS.x) / 2, BRANCH_AND_COORDS.y - BRANCH_AND_COORDS.h / 5,
                    (PC_MUX_COORDS.x - PC_MUX_COORDS.w * 4 / 3), BRANCH_AND_COORDS.y - BRANCH_AND_COORDS.h / 5,
                    (PC_MUX_COORDS.x - PC_MUX_COORDS.w * 4 / 3), PC_MUX_COORDS.y + PC_MUX_COORDS.h * 2 / 3,
                    (PC_MUX_COORDS.x), PC_MUX_COORDS.y + PC_MUX_COORDS.h * 2 / 3,
                ]),
            ], undefined, SHAPE.ARITH),
            cmp: new Component(this, CMP_COORDS, "Cmp", [
                new Connector(this, [
                    CMP_COORDS.cx, CMP_COORDS.y,
                    CMP_COORDS.cx, BRANCH_TARGET_ADDER_COORDS.by,
                    (CMP_COORDS.cx + BRANCH_TARGET_ADDER_COORDS.rx) / 2, BRANCH_TARGET_ADDER_COORDS.by,
                    (CMP_COORDS.cx + BRANCH_TARGET_ADDER_COORDS.rx) / 2, BRANCH_AND_COORDS.y + BRANCH_AND_COORDS.h * 2 / 3,
                    BRANCH_AND_COORDS.rx, BRANCH_AND_COORDS.y + BRANCH_AND_COORDS.h * 2 / 3
                ])
            ]),
            decode_control: new Component(this, DECODE_CONTROL_COORDS, "Control", [
                new Connector(this, [
                    DECODE_CONTROL_COORDS.cx, DECODE_CONTROL_COORDS.y,
                    DECODE_CONTROL_COORDS.cx, BRANCH_AND_COORDS.y + BRANCH_AND_COORDS.h / 3,
                    BRANCH_AND_COORDS.rx, BRANCH_AND_COORDS.y + BRANCH_AND_COORDS.h / 3,

                ]),
                Connector.horizontal(this, DECODE_CONTROL_COORDS.rx, (DECODE_CONTROL_COORDS.rx + (ID_EX_REG_COORDS.x - DECODE_CONTROL_COORDS.rx) * (4 / 5)), DECODE_CONTROL_COORDS.cy),
                Connector.vertical(this, ID_EX_REG_WB_COORDS.cy, ID_EX_REG_EX_COORDS.cy, (DECODE_CONTROL_COORDS.rx + (ID_EX_REG_COORDS.x - DECODE_CONTROL_COORDS.rx) * (4 / 5))),
                Connector.horizontal(this, (DECODE_CONTROL_COORDS.rx + (ID_EX_REG_COORDS.x - DECODE_CONTROL_COORDS.rx) * (4 / 5)), ID_EX_REG_WB_COORDS.x, ID_EX_REG_WB_COORDS.cy),
                Connector.horizontal(this, (DECODE_CONTROL_COORDS.rx + (ID_EX_REG_COORDS.x - DECODE_CONTROL_COORDS.rx) * (4 / 5)), ID_EX_REG_MEM_COORDS.x, ID_EX_REG_MEM_COORDS.cy),
                Connector.horizontal(this, (DECODE_CONTROL_COORDS.rx + (ID_EX_REG_COORDS.x - DECODE_CONTROL_COORDS.rx) * (4 / 5)), ID_EX_REG_EX_COORDS.x, ID_EX_REG_EX_COORDS.cy)
            ], undefined, SHAPE.CIRCLE),

            id_ex_reg: new Component(this, ID_EX_REG_COORDS, "ID/EX", [
                Connector.horizontal(this, ID_EX_REG_COORDS.rx, REG_DEST_MUX_COORDS.x, SIGN_EXT_COORDS.by + SIGN_EXT_COORDS.h / 3),
                Connector.horizontal(this, ID_EX_REG_COORDS.rx, REG_DEST_MUX_COORDS.x, SIGN_EXT_COORDS.by + SIGN_EXT_COORDS.h * 2 / 3)
            ], undefined),

            id_ex_reg_wb: new Component(this, ID_EX_REG_WB_COORDS, "", [
                Connector.horizontal(this, ID_EX_REG_WB_COORDS.rx, EX_MEM_REG_COORDS.x, ID_EX_REG_WB_COORDS.cy)
            ], undefined),
            id_ex_reg_mem: new Component(this, ID_EX_REG_MEM_COORDS, "", [
                Connector.horizontal(this, ID_EX_REG_MEM_COORDS.rx, EX_MEM_REG_COORDS.x, ID_EX_REG_MEM_COORDS.cy)
            ], undefined),
            id_ex_reg_ex: new Component(this, ID_EX_REG_EX_COORDS, "", [
                new Connector(this, [
                    ID_EX_REG_EX_COORDS.rx, ID_EX_REG_EX_COORDS.y + ID_EX_REG_EX_COORDS.h * 3 / 4,
                    ALU_OP_2_MUX_COORDS.cx, ID_EX_REG_EX_COORDS.y + ID_EX_REG_EX_COORDS.h * 3 / 4,
                    ALU_OP_2_MUX_COORDS.cx, ALU_OP_2_MUX_COORDS.y,
                ]),
                new Connector(this, [
                    ID_EX_REG_EX_COORDS.rx, ID_EX_REG_EX_COORDS.y + ID_EX_REG_EX_COORDS.h / 4,
                    ALU_COORDS.rx + (EX_MEM_REG_COORDS.x - ALU_COORDS.rx) / 3, ID_EX_REG_EX_COORDS.y + ID_EX_REG_EX_COORDS.h / 4,
                    ALU_COORDS.rx + (EX_MEM_REG_COORDS.x - ALU_COORDS.rx) / 3, REG_DEST_MUX_COORDS.by + REG_DEST_MUX_COORDS.h / 4,
                    REG_DEST_MUX_COORDS.cx, REG_DEST_MUX_COORDS.by + REG_DEST_MUX_COORDS.h / 4,
                    REG_DEST_MUX_COORDS.cx, REG_DEST_MUX_COORDS.by,

                ]),
                new Connector(this, [
                    ID_EX_REG_EX_COORDS.rx, ID_EX_REG_EX_COORDS.y + ID_EX_REG_EX_COORDS.h * 1 / 2,
                    ALU_COORDS.rx + (EX_MEM_REG_COORDS.x - ALU_COORDS.rx) * 2 / 3, ID_EX_REG_EX_COORDS.y + ID_EX_REG_EX_COORDS.h * 1 / 2,
                    ALU_COORDS.rx + (EX_MEM_REG_COORDS.x - ALU_COORDS.rx) * 2 / 3, ALU_CONTROL_COORDS.by + ALU_CONTROL_COORDS.h / 4,
                    ALU_CONTROL_COORDS.cx, ALU_CONTROL_COORDS.by + ALU_CONTROL_COORDS.h / 4,
                    ALU_CONTROL_COORDS.cx, ALU_CONTROL_COORDS.by,

                ])
            ], undefined),

            // Execute
            alu: new Component(this, ALU_COORDS, "ALU", [], undefined, SHAPE.ARITH),
            alu_control: new Component(this, ALU_CONTROL_COORDS, "ALU Control", [], undefined, SHAPE.CIRCLE),
            reg_dest_mux: new Component(this, REG_DEST_MUX_COORDS, "Mux", [
                Connector.horizontal(this, REG_DEST_MUX_COORDS.rx, EX_MEM_REG_COORDS.x, REG_DEST_MUX_COORDS.cy)
            ], undefined),
            alu_op_2_mux: new Component(this, ALU_OP_2_MUX_COORDS, "Mux", [], undefined),

            ex_mem_reg: new Component(this, EX_MEM_REG_COORDS, "EX/MEM", [], undefined),
            ex_mem_reg_wb: new Component(this, EX_MEM_REG_WB_COORDS, "", [], undefined),
            ex_mem_reg_mem: new Component(this, EX_MEM_REG_MEM_COORDS, "", [], undefined),
            // Memory
            d_mem: new Component(this, D_MEM_COORDS, "Data Memory", [], undefined),
            mem_wb_reg: new Component(this, MEM_WB_REG_COORDS, "MEM/WB", [], undefined),
            // Writeback
            wb_mux: new Component(this, WB_MUX_COORDS, "Mux", [], undefined),

        };
    }

    update(sim_state) {
        this.state = sim_state;
        console.log(JSON.stringify(sim_state));
    }

    draw() {
        this.drawing.clear();
        for (const key in this.children) {
            this.children[key].draw();
        }
    }
}



export {Simulator as Simulator};
