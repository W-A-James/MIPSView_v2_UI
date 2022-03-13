import * as s from "@svgdotjs/svg.js";

// TODO: Pick colours for control and data path signals
// TODO: Pick widths for datapath connections and control connections
// TODO: Add different shapes to allow for eg: ovals, etc
let CONTROL_OUTLINE = "#f00";
let CONTROL_FILL = "#FFF";

let DATA_PATH_OUTLINE = "#000";
let DATA_PATH_FILL = "#FFF";

const ROOT3OVER2 = Math.sqrt(3) / 2;
let shapeCount = 0;
let connCount = 0;

function vec_scale(v, s) {
    return {
        x: v.x * s,
        y: v.y * s
    };
}

function vec_perpendicular(v) {
    return {
        x: v.y,
        y: -v.x
    };
}

function vec_len(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y)
}

class Connector {
    constructor(owner, path, weight = PATH_WIDTH, onclick = undefined, markers = {start: false, end: true}) {
        this.owner = owner;
        this.path = path;
        this.line_weight = weight;
        this.colour = "#000";
        this.onclick = onclick ? onclick : () => {};
        if (markers) {
            this.markerStart = markers.start ? markers.start : false;
            this.markerEnd = markers.end ? markers.end: false;
        }
        this.count = connCount;
        connCount++;
    }

    static horizontal(owner, startX, endX, y, weight, onclick, markers = {start: false, end: true}) {
        let rv = new Connector(owner, [startX, y, endX, y], weight, onclick, markers);
        return rv;
    }

    static vertical(owner, startY, endY, x, weight, onclick, markers = {start: false, end: true}) {
        return new Connector(owner, [x, startY, x, endY], weight, onclick, markers);
    }

    get_end_marker_path(absolute_path, len) {
        let last_points = absolute_path.slice(-4);

        let ps = {x: last_points[0], y: last_points[1]};
        let p1 = {x: last_points[2], y: last_points[3]};
        let U = {x: p1.x - ps.x, y: p1.y - ps.y};
        let u = vec_scale(U, 1.0 / vec_len(U));
        let v = vec_perpendicular(u);
        let p0 = {
            x: p1.x + (v.x * len / 2) - (u.x * ROOT3OVER2 * len),
            y: p1.y + (v.y * len / 2) - (u.y * ROOT3OVER2 * len)
        };

        let p2 = {
            x: p1.x - (v.x * len / 2) - (u.x * ROOT3OVER2 * len),
            y: p1.y - (v.y * len / 2) - (u.y * ROOT3OVER2 * len)
        };

        return [p1.x, p1.y, p2.x, p2.y, p0.x, p0.y];
    }
    draw() {
        let frame = document.getElementById(this.owner.target_element.substr(1));
        let drawing_width = frame.clientWidth;
        let drawing_height = frame.clientHeight;

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

        let l = this.owner.drawing.polyline(new_path)
            .stroke(
                {
                    width: this.line_weight,
                    color: this.colour,
                }
            )
            .fill('none')
            .attr({"id": `conn_${this.count}`})
            .on("click", this.onclick === undefined ? () => {} : this.onclick);

        if (this.markerEnd) {
            let p = this.get_end_marker_path(new_path, 8);
            this.owner.drawing.polygon(p);
        }

        if (this.markerStart) {
            l.marker("start", 8, 8, add => {
                add.circle(8)
            });
        }
        // TODO: Add Labels
    }
}

const SHAPE = {
    CIRCLE: "CIRCLE",
    BOX: "BOX",
    ARITH: "ARITH"
};

const LAMBDA = 0.3;
const PHI = 0.333333;
class Component {
    constructor(owner, spec, name, connectors, onclick=undefined, shape=SHAPE.BOX, classList="") {
        this.owner = owner;
        this.x = spec.x;
        this.y = spec.y;
        this.width = spec.w;
        this.height = spec.h;
        this.name = name;
        this.fill = "#FFF";
        this.outline = "#000";
        this.obj = null;
        this.shape = shape;
        this.connectors = connectors;
        this.onclick = onclick;
        this.classList = classList;
        this.count = shapeCount;
        shapeCount++;
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
        let l = lambda * w;
        let p = phi * h;

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
                let pts = this.get_arith_pts(loc.x, loc.y, size.x, size.y, LAMBDA, PHI);
                this.obj = this.owner.drawing.polygon(pts)
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
                this.obj = this.owner.drawing.ellipse(size.x, size.y)
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
                this.obj = this.owner.drawing.rect(size.x, size.y)
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

        this.obj = this.obj.attr({"id": `shape_${this.count}`});
        this.classList.split(" ").forEach(c => this.obj.addClass(c));
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
            .font("anchor", "middle");
        
        let bbox = this.text.node.getBoundingClientRect();
        let h = (this.text.node.getBoundingClientRect().height);
        this.text = this.text
            .y(center.y - h/2);

        this.connectors.forEach(c => c.draw());
    }
}

function makeBox(x, y, w, h) {
    return {x: x, y: y, w: w, h: h, rx: x + w, by: y + h, cx: x + w / 2, cy: y + h / 2};
}

const REG_WIDTH = 0.03;
const REG_HEIGHT = 0.70;
const REG_Y_POS = 0.12;
const PATH_WIDTH = 1;

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
const SIGN_EXT_COORDS = makeBox(0.31, 0.6, REG_WIDTH, REG_WIDTH * 3);

const LEFT_SHIFT_2_COORDS = makeBox(0.31, 0.3, REG_WIDTH, REG_WIDTH * 2.5);
const BRANCH_TARGET_ADDER_COORDS = makeBox(0.35, 0.22, 0.03, 0.075);
const CMP_COORDS = makeBox(0.40, 0.3, REG_WIDTH, 0.05);
const DECODE_CONTROL_COORDS = makeBox(0.35, 0.12, REG_WIDTH, REG_WIDTH * 3);

const ALU_COORDS = makeBox(0.59, 0.4, 0.05, 0.16);
const ALU_CONTROL_COORDS = makeBox(0.5875, 0.62, 0.03, 0.08);
const REG_DEST_MUX_COORDS = makeBox(0.54, 0.69, 0.03, 0.1);
const ALU_OP_2_MUX_COORDS = makeBox(0.53, 0.5, 0.03, 0.07);

const EX_MEM_REG_COORDS = makeBox(0.7, REG_Y_POS, REG_WIDTH, REG_HEIGHT);
const EX_MEM_REG_WB_COORDS = makeBox(0.7, REG_Y_POS, REG_WIDTH, 0.05);
const EX_MEM_REG_MEM_COORDS = makeBox(0.7, REG_Y_POS + 0.05, REG_WIDTH, 0.05);

const D_MEM_COORDS = makeBox(0.76, 0.45, 0.1, 0.15);
const MEM_WB_REG_COORDS = makeBox(0.88, REG_Y_POS, REG_WIDTH, REG_HEIGHT);
const MEM_WB_REG_WB_COORDS = makeBox(0.88, REG_Y_POS, REG_WIDTH, 0.05);
const WB_MUX_COORDS = makeBox(0.94, 0.45, 0.03, 0.1);

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
                        ], PATH_WIDTH, _ => {}, {end: true}
                    )
                ]
                , console.log, SHAPE.BOX, "reg"),
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
            i_mem: new Component(this, I_MEM_COORDS, "Instruction\nMemory", [
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
                Connector.vertical(this, REG_FILE_COORDS.y + REG_FILE_COORDS.h / 5, CMP_COORDS.by, CMP_COORDS.x + CMP_COORDS.w / 3, PATH_WIDTH, undefined, {start: true, end: true}),
                /* Reg data 2*/
                Connector.horizontal(this, REG_FILE_COORDS.rx, ID_EX_REG_COORDS.x, REG_FILE_COORDS.y + REG_FILE_COORDS.h * 2 / 5),
                /* To cmp 2 */
                Connector.vertical(this, REG_FILE_COORDS.y + REG_FILE_COORDS.h * 2 / 5, CMP_COORDS.by, CMP_COORDS.x + CMP_COORDS.w * 2 / 3, PATH_WIDTH, undefined, {start: true, end: true}),
            ], undefined),
            sign_extend: new Component(this, SIGN_EXT_COORDS, "Sign\nExtend", [
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
                    CMP_COORDS.cx, BRANCH_AND_COORDS.y + BRANCH_AND_COORDS.h * 2 / 3,
                    BRANCH_AND_COORDS.rx, BRANCH_AND_COORDS.y + BRANCH_AND_COORDS.h * 2 / 3
                ])
            ]),
            decode_control: new Component(this, DECODE_CONTROL_COORDS, "Control", [
                new Connector(this, [
                    DECODE_CONTROL_COORDS.cx, DECODE_CONTROL_COORDS.y,
                    DECODE_CONTROL_COORDS.cx, BRANCH_AND_COORDS.y + BRANCH_AND_COORDS.h / 3,
                    BRANCH_AND_COORDS.rx, BRANCH_AND_COORDS.y + BRANCH_AND_COORDS.h / 3,

                ]),
                Connector.horizontal(this, DECODE_CONTROL_COORDS.rx, (DECODE_CONTROL_COORDS.rx + (ID_EX_REG_COORDS.x - DECODE_CONTROL_COORDS.rx) * (4 / 5)), DECODE_CONTROL_COORDS.cy, PATH_WIDTH, undefined, {start: false, end: false}),
                Connector.vertical(this, ID_EX_REG_WB_COORDS.cy, ID_EX_REG_EX_COORDS.cy, (DECODE_CONTROL_COORDS.rx + (ID_EX_REG_COORDS.x - DECODE_CONTROL_COORDS.rx) * (4 / 5)), PATH_WIDTH, undefined, {start: false, end: false}),
                Connector.horizontal(this, (DECODE_CONTROL_COORDS.rx + (ID_EX_REG_COORDS.x - DECODE_CONTROL_COORDS.rx) * (4 / 5)), ID_EX_REG_WB_COORDS.x, ID_EX_REG_WB_COORDS.cy, PATH_WIDTH, undefined, {start: false, end: true}),
                Connector.horizontal(this, (DECODE_CONTROL_COORDS.rx + (ID_EX_REG_COORDS.x - DECODE_CONTROL_COORDS.rx) * (4 / 5)), ID_EX_REG_MEM_COORDS.x, ID_EX_REG_MEM_COORDS.cy, PATH_WIDTH, undefined, {start: true, end: true}),
                Connector.horizontal(this, (DECODE_CONTROL_COORDS.rx + (ID_EX_REG_COORDS.x - DECODE_CONTROL_COORDS.rx) * (4 / 5)), ID_EX_REG_EX_COORDS.x, ID_EX_REG_EX_COORDS.cy, PATH_WIDTH, undefined, {start: false, end: true})
            ], undefined, SHAPE.CIRCLE),

            id_ex_reg: new Component(this, ID_EX_REG_COORDS, "ID/EX", [
                Connector.horizontal(this, ID_EX_REG_COORDS.rx, REG_DEST_MUX_COORDS.x, SIGN_EXT_COORDS.by + SIGN_EXT_COORDS.h / 3),
                Connector.horizontal(this, ID_EX_REG_COORDS.rx, REG_DEST_MUX_COORDS.x, SIGN_EXT_COORDS.by + SIGN_EXT_COORDS.h * 2 / 3),
                Connector.horizontal(this, ID_EX_REG_COORDS.rx, ALU_COORDS.x, REG_FILE_COORDS.y + REG_FILE_COORDS.h / 5),
                new Connector(this, [
                    ID_EX_REG_COORDS.rx, SIGN_EXT_COORDS.cy,
                    (ID_EX_REG_COORDS.rx + ALU_CONTROL_COORDS.x) / 2, SIGN_EXT_COORDS.cy,
                    (ID_EX_REG_COORDS.rx + ALU_CONTROL_COORDS.x) / 2, ALU_CONTROL_COORDS.cy,
                    ALU_CONTROL_COORDS.x, ALU_CONTROL_COORDS.cy,
                ]),
                new Connector(this, [
                    (ID_EX_REG_COORDS.rx + (ALU_OP_2_MUX_COORDS.x - ID_EX_REG_COORDS.rx) / 3), SIGN_EXT_COORDS.cy,
                    (ID_EX_REG_COORDS.rx + (ALU_OP_2_MUX_COORDS.x - ID_EX_REG_COORDS.rx) / 3), ALU_OP_2_MUX_COORDS.y + ALU_OP_2_MUX_COORDS.h * 2 / 3,
                    ALU_OP_2_MUX_COORDS.x, ALU_OP_2_MUX_COORDS.y + ALU_OP_2_MUX_COORDS.h * 2 / 3,
                ], PATH_WIDTH, undefined, {start: true, end: true}),
                new Connector(this, [
                    ID_EX_REG_COORDS.rx, REG_FILE_COORDS.y + REG_FILE_COORDS.h * 2 / 5,
                    ID_EX_REG_COORDS.rx + (ALU_OP_2_MUX_COORDS.x - ID_EX_REG_COORDS.rx) / 3, REG_FILE_COORDS.y + REG_FILE_COORDS.h * 2 / 5,
                    ID_EX_REG_COORDS.rx + (ALU_OP_2_MUX_COORDS.x - ID_EX_REG_COORDS.rx) / 3, ALU_OP_2_MUX_COORDS.y + ALU_OP_2_MUX_COORDS.h / 3,
                    ALU_OP_2_MUX_COORDS.x, ALU_OP_2_MUX_COORDS.y + ALU_OP_2_MUX_COORDS.h / 3,
                ]),
                new Connector(this, [
                    ID_EX_REG_COORDS.rx + (ALU_OP_2_MUX_COORDS.x - ID_EX_REG_COORDS.rx) * 2 / 3, ALU_OP_2_MUX_COORDS.y + ALU_OP_2_MUX_COORDS.h / 3,
                    ID_EX_REG_COORDS.rx + (ALU_OP_2_MUX_COORDS.x - ID_EX_REG_COORDS.rx) * 2 / 3, D_MEM_COORDS.by - D_MEM_COORDS.h / 7,
                    EX_MEM_REG_COORDS.x, D_MEM_COORDS.by - D_MEM_COORDS.h / 7,
                ], PATH_WIDTH, undefined, {start: true, end: true})
            ], (e) => {
                console.log(this.state.id_ex_reg.current_map);
            }),

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
            alu: new Component(this, ALU_COORDS, "ALU", [
                Connector.horizontal(this, ALU_COORDS.rx, EX_MEM_REG_COORDS.x, ALU_COORDS.cy)
            ], undefined, SHAPE.ARITH),
            alu_control: new Component(this, ALU_CONTROL_COORDS, "ALU\nControl", [
                new Connector(this, [
                    ALU_CONTROL_COORDS.rx, ALU_CONTROL_COORDS.cy,
                    (ALU_CONTROL_COORDS.rx + ALU_COORDS.rx) / 2, ALU_CONTROL_COORDS.cy,
                    (ALU_CONTROL_COORDS.rx + ALU_COORDS.rx) / 2, ALU_COORDS.by * 0.92,
                ])
            ], undefined, SHAPE.CIRCLE),
            reg_dest_mux: new Component(this, REG_DEST_MUX_COORDS, "Mux", [
                Connector.horizontal(this, REG_DEST_MUX_COORDS.rx, EX_MEM_REG_COORDS.x, REG_DEST_MUX_COORDS.cy)
            ], undefined),
            alu_op_2_mux: new Component(this, ALU_OP_2_MUX_COORDS, "Mux", [
                Connector.horizontal(this, ALU_OP_2_MUX_COORDS.rx, ALU_COORDS.x, ALU_OP_2_MUX_COORDS.cy)
            ], undefined),

            ex_mem_reg: new Component(this, EX_MEM_REG_COORDS, "EX/MEM", [
                Connector.horizontal(this, EX_MEM_REG_COORDS.rx, D_MEM_COORDS.x, ALU_COORDS.cy, PATH_WIDTH, undefined, {start: false, end: true}),
                new Connector(this, [
                    (EX_MEM_REG_COORDS.rx + D_MEM_COORDS.x) / 2, ALU_COORDS.cy,
                    (EX_MEM_REG_COORDS.rx + D_MEM_COORDS.x) / 2, D_MEM_COORDS.by + D_MEM_COORDS.h / 4,
                    MEM_WB_REG_COORDS.x, D_MEM_COORDS.by + D_MEM_COORDS.h / 4,
                ], PATH_WIDTH, undefined, {start: true, end: true}),
                Connector.horizontal(this, EX_MEM_REG_COORDS.rx, MEM_WB_REG_COORDS.x, REG_DEST_MUX_COORDS.cy, PATH_WIDTH),
                Connector.horizontal(this, EX_MEM_REG_COORDS.rx, D_MEM_COORDS.x, D_MEM_COORDS.by - D_MEM_COORDS.h / 7)
            ], undefined),
            ex_mem_reg_wb: new Component(this, EX_MEM_REG_WB_COORDS, "", [
                Connector.horizontal(this, EX_MEM_REG_WB_COORDS.rx, MEM_WB_REG_WB_COORDS.x, EX_MEM_REG_WB_COORDS.cy, PATH_WIDTH, undefined, {start: false, end: true})
            ], undefined),
            ex_mem_reg_mem: new Component(this, EX_MEM_REG_MEM_COORDS, "", [
                new Connector(this, [
                    EX_MEM_REG_MEM_COORDS.rx, EX_MEM_REG_MEM_COORDS.y + EX_MEM_REG_MEM_COORDS.h / 3,
                    D_MEM_COORDS.cx, EX_MEM_REG_MEM_COORDS.y + EX_MEM_REG_MEM_COORDS.h / 3,
                    D_MEM_COORDS.cx, D_MEM_COORDS.y
                ]),
                new Connector(this, [
                    EX_MEM_REG_MEM_COORDS.rx, EX_MEM_REG_MEM_COORDS.y + EX_MEM_REG_MEM_COORDS.h * 2 / 3,
                    EX_MEM_REG_MEM_COORDS.rx + (D_MEM_COORDS.x - EX_MEM_REG_MEM_COORDS.rx) / 4, EX_MEM_REG_MEM_COORDS.y + EX_MEM_REG_MEM_COORDS.h * 2 / 3,
                    EX_MEM_REG_MEM_COORDS.rx + (D_MEM_COORDS.x - EX_MEM_REG_MEM_COORDS.rx) / 4, D_MEM_COORDS.by + D_MEM_COORDS.h * 1 / 3,
                    D_MEM_COORDS.cx, D_MEM_COORDS.by + D_MEM_COORDS.h * 1 / 3,
                    D_MEM_COORDS.cx, D_MEM_COORDS.by,
                ]),

            ], undefined),
            // Memory
            d_mem: new Component(this, D_MEM_COORDS, "Data\nMemory", [
                Connector.horizontal(this, D_MEM_COORDS.rx, MEM_WB_REG_COORDS.x, ALU_COORDS.cy, PATH_WIDTH, undefined, {start: false, end: true})
            ], undefined),
            mem_wb_reg: new Component(this, MEM_WB_REG_COORDS, "MEM/WB", [
                Connector.horizontal(this, MEM_WB_REG_COORDS.rx, WB_MUX_COORDS.x, ALU_COORDS.cy, PATH_WIDTH, undefined, {start: false, end: true}),
                new Connector(this, [
                    MEM_WB_REG_COORDS.rx, D_MEM_COORDS.by + D_MEM_COORDS.h / 4,
                    (MEM_WB_REG_COORDS.rx + WB_MUX_COORDS.x) / 2, D_MEM_COORDS.by + D_MEM_COORDS.h / 4,
                    (MEM_WB_REG_COORDS.rx + WB_MUX_COORDS.x) / 2, WB_MUX_COORDS.y + WB_MUX_COORDS.h * 2 / 3,
                    WB_MUX_COORDS.x, WB_MUX_COORDS.y + WB_MUX_COORDS.h * 2 / 3,
                ], PATH_WIDTH, undefined, {start: false, end: true}),
                new Connector(this, [
                    MEM_WB_REG_COORDS.rx, REG_DEST_MUX_COORDS.cy,
                    (MEM_WB_REG_COORDS.rx + WB_MUX_COORDS.x) / 2, REG_DEST_MUX_COORDS.cy,
                    (MEM_WB_REG_COORDS.rx + WB_MUX_COORDS.x) / 2, MEM_WB_REG_COORDS.by + MEM_WB_REG_COORDS.h / 12,
                    (IF_ID_REG_COORDS.rx + (REG_FILE_COORDS.x - IF_ID_REG_COORDS.rx) * 3 / 4), MEM_WB_REG_COORDS.by + MEM_WB_REG_COORDS.h / 12,
                    (IF_ID_REG_COORDS.rx + (REG_FILE_COORDS.x - IF_ID_REG_COORDS.rx) * 3 / 4), REG_FILE_COORDS.y + REG_FILE_COORDS.h * 3 / 5,
                    REG_FILE_COORDS.x, REG_FILE_COORDS.y + REG_FILE_COORDS.h * 3 / 5


                ], PATH_WIDTH, undefined, {start: false, end: true})
            ], undefined),
            mem_wb_reg_wb: new Component(this, MEM_WB_REG_WB_COORDS, "", [
                new Connector(this, [
                    MEM_WB_REG_WB_COORDS.rx, MEM_WB_REG_WB_COORDS.y + MEM_WB_REG_WB_COORDS.h * 2 / 3,
                    WB_MUX_COORDS.cx, MEM_WB_REG_WB_COORDS.y + MEM_WB_REG_WB_COORDS.h * 2 / 3,
                    WB_MUX_COORDS.cx, WB_MUX_COORDS.y
                ], PATH_WIDTH, undefined, {start: false, end: true}),
                new Connector(this, [
                    MEM_WB_REG_WB_COORDS.rx, MEM_WB_REG_WB_COORDS.y + MEM_WB_REG_WB_COORDS.h / 3,
                    WB_MUX_COORDS.rx + (1.0 - WB_MUX_COORDS.rx) * 2 / 3, MEM_WB_REG_WB_COORDS.y + MEM_WB_REG_WB_COORDS.h / 3,
                    WB_MUX_COORDS.rx + (1.0 - WB_MUX_COORDS.rx) * 2 / 3, MEM_WB_REG_COORDS.by + (1.0 - MEM_WB_REG_COORDS.by) * 2 / 3,
                    REG_FILE_COORDS.cx, MEM_WB_REG_COORDS.by + (1.0 - MEM_WB_REG_COORDS.by) * 2 / 3,
                    REG_FILE_COORDS.cx, REG_FILE_COORDS.by

                ])
            ], undefined),
            // Writeback
            wb_mux: new Component(this, WB_MUX_COORDS, "Mux", [
                new Connector(this, [
                    WB_MUX_COORDS.rx, WB_MUX_COORDS.cy,
                    WB_MUX_COORDS.rx + (1.0 - WB_MUX_COORDS.rx) / 3, WB_MUX_COORDS.cy,
                    WB_MUX_COORDS.rx + (1.0 - WB_MUX_COORDS.rx) / 3, MEM_WB_REG_COORDS.by + (MEM_WB_REG_COORDS.h / 8),
                    IF_ID_REG_COORDS.rx + (REG_FILE_COORDS.x - IF_ID_REG_COORDS.rx) * 6 / 7, MEM_WB_REG_COORDS.by + (MEM_WB_REG_COORDS.h / 8),
                    IF_ID_REG_COORDS.rx + (REG_FILE_COORDS.x - IF_ID_REG_COORDS.rx) * 6 / 7, REG_FILE_COORDS.y + REG_FILE_COORDS.h * 4 / 5,
                    REG_FILE_COORDS.x, REG_FILE_COORDS.y + REG_FILE_COORDS.h * 4 / 5,

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



export {Simulator as Simulator};
