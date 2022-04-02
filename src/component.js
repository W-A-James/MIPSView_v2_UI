import * as s from "@svgdotjs/svg.js";

const PATH_WIDTH = 1;
// TODO: Pick colours for control and data path signals
// TODO: Pick widths for datapath connections and control connections
// TODO: Add different shapes to allow for eg: ovals, etc
// todo
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
  return Math.sqrt((v.x * v.x) + (v.y * v.y))
}

function get_unit_vec(v) {
  let len = vec_len(v);
  return vec_scale(v, 1 / len);
}

function vec_dot_prod(u, v) {
  return u.x * v.x + u.y * v.y;
}

function vec_get_unit_vec_offset_by_45(v) {
  throw "Unimplemented";
  // Check if original vector is vertical
  if (v.y > Number.EPSILON) {
    let unit = get_unit_vec(v);
    let ys = [];
    let sqr_det = Math.sqrt(32 * unit.y * unit.y - 32 * unit.y * unit.y - 16 * unit.y * unit.y + 8 * unit.x * unit.x - 4 * unit.x * unit.x * unit.x * unit.x);
    let denom = 2 * (4 * unit.y * unit.y + unit.x * unit.x);
    // positive
    ys.push((4 * Math.sqrt(2) * unit.y + sqr_det) / denom);
    // negative
    ys.push((4 * Math.sqrt(2) * unit.y - sqr_det) / denom);

    let x1 = ((Math.sqrt(2) / 2) - ys[0] * unit.y) / unit.x;
    let x2 = ((Math.sqrt(2) / 2) - ys[1] * unit.y) / unit.x;

    return [{ x: x1, y: y[0] }, { x: x2, y: y[1] }];
  }
  else {
    let unit = get_unit_vec(v);
    return get_unit_vec({ x: unit.y, y: unit.y })
  }
}

// TODO: Add end and start labels
class Connector {
  constructor(owner, path, weight = PATH_WIDTH, onclick = undefined, markers = { start: false, end: true, startText: null, endText: null }, style = { color: "#000" }) {
    this.owner = owner;
    this.path = path;
    this.line_weight = weight;
    if (style) {
      style = Object.assign({ color: "#000" }, style);
    }
    this.colour = style.color;
    this.onclick = onclick ? onclick : () => { };
    if (markers) {
      markers = Object.assign({ start: false, end: true, startText: null, endText: null }, markers);
      this.markerStart = markers.start ? markers.start : false;
      this.markerEnd = markers.end ? markers.end : false;
      this.markerStartText = markers.startText ? markers.startText : "";
      this.markerEndText = markers.endText ? markers.endText : "";
    }
    this.count = connCount;
    connCount++;
  }

  static horizontal(owner, startX, endX, y, weight, onclick, markers = { start: false, end: true, startText: null, endText: null }, style = { color: "#000" }) {
    return new Connector(owner, [startX, y, endX, y], weight, onclick, markers, style);
  }

  static vertical(owner, startY, endY, x, weight, onclick, markers = { start: false, end: true, startText: null, endText: null }, style = { color: "#000" }) {
    return new Connector(owner, [x, startY, x, endY], weight, onclick, markers, style);
  }

  get_end_marker_path(absolute_path, len) {
    let last_points = absolute_path.slice(-4);

    let ps = { x: last_points[0], y: last_points[1] };
    let p1 = { x: last_points[2], y: last_points[3] };
    let U = { x: p1.x - ps.x, y: p1.y - ps.y };
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

  get_size_marker_path(absolute_path, size, pos) {
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
      .attr({ "id": `conn_${this.count}` })
      .on("click", this.onclick === undefined ? () => { } : this.onclick);

    if (this.markerEnd) {
      let p = this.get_end_marker_path(new_path, 6);
      this.owner.drawing.polygon(p).stroke(this.colour).fill(this.colour);
    }

    if (this.markerStart) {
      l.marker("start", 6, 6, add => {
        add.circle(6).stroke(this.colour).fill(this.colour)
      });
    }

    if (this.markerStartText) {
      let startText = this.owner.drawing
        .text(this.markerStartText)
        .font("anchor", "right")
        .addClass("component-label");
      let bbox = startText.node.getBoundingClientRect();
      startText = startText
        .y(new_path[1] - bbox.height / 2)
        .x(new_path[0] - bbox.width);
    }

    if (this.markerEndText) {
      let endText = this.owner.drawing
        .text(this.markerEndText)
        .x(new_path[new_path.length - 2])
        .font("anchor", "left")
        .addClass("component-label");

      let bbox = endText.node.getBoundingClientRect();
      endText = endText
        .y(new_path[new_path.length - 1] - bbox.height / 2);
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
// TODO: Update constructor to include tooltip 
class Component {
  constructor(owner, spec, name, connectors, onclick = undefined,
    shape = SHAPE.BOX, classList = "", tooltip = { has: true, f: () => { } }) {

    this.owner = owner;
    this.x = spec.x;
    this.y = spec.y;
    this.width = spec.w;
    this.height = spec.h;
    this.name = name;
    this.fill = spec.fill ? spec.fill : "#FFFFFF";
    this.outline = spec.outline ? spec.outline : "#000";
    this.obj = null;
    this.shape = shape;
    this.connectors = connectors;
    this.onclick = onclick;
    this.classList = classList;
    this.count = shapeCount;
    this.hasTooltip = tooltip.has;
    this.tooltipDrawFunc = tooltip.f;
    this.tooltipEl = document.createElement("div");

    let tooltipID = `shape${shapeCount}_tooltip`;

    this.tooltipEl.classList.add("tooltip");
    this.tooltipEl.id = tooltipID;
    document.getElementById(this.owner.target_element.substr(1)).append(this.tooltipEl);

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
          .on('click', this.onclick === undefined ? () => { } : this.onclick);
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
          .on('click', this.onclick === undefined ? () => { } : this.onclick);
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
          .on('click', this.onclick === undefined ? () => { } : this.onclick);
    }

    this.obj = this.obj.attr({ "id": `shape_${this.count}` });
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
    let h = (bbox.height);
    this.text = this.text
      .y(center.y - h / 2);

    this.connectors.forEach(c => c.draw());
  }
}

export { Component, Connector, SHAPE, PATH_WIDTH };
