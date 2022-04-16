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

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  scale(s) {
    return new Vector(this.x / s, this.y / s);
  }

  perpendicular() {
    return new Vector(this.y, -this.x);
  }

  len() {
    return Math.sqrt((this.x * this.x) + (this.y * this.y));
  }

  getUnit() {
    let scale = 1 / this.len();
    return this.scale(scale);
  }

  dot(other) {
    return this.x * other.x + this.y * other.y;
  }
}

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


function vec_rotate(u, theta, origin = { x: 0, y: 0 }) {
  let xLessOrig = u.x - origin.x;
  let yLessOrig = u.y - origin.y;
  let cTheta = Math.cos(theta);
  let sTheta = Math.sin(theta);
  let shiftedX = xLessOrig * cTheta + yLessOrig * -sTheta;
  let shiftedY = xLessOrig * sTheta + yLessOrig * cTheta;

  return { x: shiftedX + origin.x, y: shiftedY + origin.y };
}
function vec_get_unit_vec_offset_by_45(v, origin = { x: 0, y: 0 }) {
  // Check if original vector is vertical
  let unit = get_unit_vec(v);
  let rotUnit = vec_rotate(unit, Math.PI / 4.0, origin);

  return vec_scale(rotUnit, vec_len(v));
}

// TODO: Add end and start labels
class Connector {
  constructor(owner, path, weight = PATH_WIDTH, markers = { start: false, end: true, startText: null, endText: null, busWidth: 1 }, style = { color: "#000" }) {
    this.owner = owner;
    this.path = path;
    this.line_weight = weight;
    if (style) {
      style = Object.assign({ color: "#000" }, style);
    }
    this.colour = style.color;
    if (markers) {
      markers = Object.assign({ start: false, end: true, startText: null, endText: null, busWidth: 1 }, markers);
      this.markerStart = markers.start ? markers.start : false;
      this.markerEnd = markers.end ? markers.end : false;
      this.markerStartText = markers.startText ? markers.startText : "";
      this.markerEndText = markers.endText ? markers.endText : "";
      if (markers.busWidth > 1) {
        this.busWidth = markers.busWidth;
      }
    }
    this.count = connCount;
    connCount++;
  }

  static horizontal(owner, startX, endX, y, weight, markers = { start: false, end: true, startText: null, endText: null }, style = { color: "#000" }) {
    return new Connector(owner, [startX, y, endX, y], weight, markers, style);
  }

  static vertical(owner, startY, endY, x, weight, markers = { start: false, end: true, startText: null, endText: null }, style = { color: "#000" }) {
    return new Connector(owner, [x, startY, x, endY], weight, markers, style);
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
      let x_diff = Math.abs(new_path[new_path.length - 4] - new_path[new_path.length - 2]);
      if (x_diff > 0.1) {
        // Horizontal
        let endText = this.owner.drawing
          .text(this.markerEndText)
          .x(new_path[new_path.length - 2])
          .font("anchor", "left")
          .addClass("component-label");

        let bbox = endText.node.getBoundingClientRect();
        endText = endText
          .y(new_path[new_path.length - 1] - bbox.height / 2);
      } else {
        // Vertical
        let endText = this.owner.drawing
          .text(this.markerEndText)
          .x(new_path[new_path.length - 2])
          .font("anchor", "middle")
          .addClass("component-label");

        let bbox = endText.node.getBoundingClientRect();
        endText = endText
          .y(new_path[new_path.length - 1] - bbox.height);
      }
    }

    if (this.busWidth) {
      let l = new_path.length;
      // Get 45 degree cross and draw text with busWidth
      let baseVec = { x: new_path[l - 2] - new_path[l - 4], y: new_path[l - 1] - new_path[l - 3] };
      let orig = { x: (new_path[l - 2] + new_path[l - 4]) / 2, y: (new_path[l - 1] + new_path[l - 3]) / 2 };
      let unit = get_unit_vec(baseVec);
      let rotUnit = vec_rotate(unit, Math.PI / 4, orig);
      // TODO: Get point below, att rotUnit to get point above
    }
    // TODO: Add Labels
  }
}

const SHAPE = {
  CIRCLE: "CIRCLE",
  BOX: "BOX",
  ARITH: "ARITH",
  AND: "AND"
};

const LAMBDA = 0.3;
const PHI = 0.333333;
// TODO: Update constructor to include tooltip 

// Onclick always shows/hides the tooltip, what should be parametrized as a function
// is the content of the tooltip and how it is generated
class Component {
  constructor(owner, spec, name, connectors,
    shape = SHAPE.BOX, classList = "", tooltip = { has: false, description: "", updateState: () => { } }) {

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
    this.classList = classList;
    this.count = shapeCount;
    this.hasTooltip = tooltip.has;
    this.tooltipUpdate = tooltip.updateState;

    if (tooltip.has) {
      // Create main tooltip div
      this.tooltipEl = document.createElement("div");

      // Create nav
      let tooltipNav = document.createElement("nav");
      tooltipNav.className = "tooltip_nav";

      // Create description/state tabs
      let tooltipNavShowState = document.createElement("button");
      tooltipNavShowState.innerText = "State";
      tooltipNavShowState.className = "tooltip_nav_button";

      let tooltipNavShowDesc = document.createElement("button");
      tooltipNavShowDesc.innerText = "Desc.";
      tooltipNavShowDesc.className = "tooltip_nav_button";

      let tooltipNavClose = document.createElement("button");
      tooltipNavClose.innerText = "X";
      tooltipNavClose.className = "tooltip_nav_button";
      tooltipNavClose.style.backgroundColor = "red";


      let tooltipDisplay = document.createElement("div");
      tooltipDisplay.className = "tooltip_display";

      // Create state div
      let stateDiv = document.createElement("div");
      stateDiv.classList.add("tooltip_state");
      // Create description div
      let descrDiv = document.createElement("div");
      descrDiv.classList.add("tooltip_descr", "invisible");
      descrDiv.innerHTML = tooltip.description ? tooltip.description : "";


      this.tooltipEl.append(tooltipNav, tooltipDisplay);
      tooltipNav.append(tooltipNavShowState, tooltipNavShowDesc, tooltipNavClose);
      tooltipDisplay.append(stateDiv, descrDiv);

      // TODO: Highlight currently selected view
      tooltipNavShowState.onclick = () => {
        this.tooltipEl.getElementsByClassName("tooltip_state")[0].classList.remove("invisible");
        this.tooltipEl.getElementsByClassName("tooltip_descr")[0].classList.add("invisible");
        this.updateToolTip();

      };
      tooltipNavShowDesc.onclick = () => {
        this.tooltipEl.getElementsByClassName("tooltip_state")[0].classList.add("invisible");
        this.tooltipEl.getElementsByClassName("tooltip_descr")[0].classList.remove("invisible");
        this.updateToolTip();
      };

      tooltipNavClose.onclick = () => {
        this.tooltipEl.classList.toggle("invisible");
      };


      let tooltipID = `shape${shapeCount}_tooltip`;

      this.tooltipEl.classList.add("tooltip", "invisible", "tooltip_outer");
      this.tooltipEl.id = tooltipID;
      document.getElementById(this.owner.target_element.substr(1)).append(this.tooltipEl);
      this.onclick = () => this.toggleTooltip();
    }

    shapeCount++;
  }

  toggleTooltip() {
    this.tooltipEl.classList.toggle("invisible");
    this.updateToolTip();
  }

  updateToolTip() {
    if (this.hasTooltip) {
      // Delete tooltip state content
      let content = this.tooltipUpdate();

      if (content) {
        let state = this.tooltipEl.getElementsByClassName("tooltip_state")[0];
        state.innerHTML = "";
        state.append(content);
      }
    }
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

  get_and_path(x, y, w, h, dir) {
    let r;
    let c;
    let s;
    let path;
    switch (dir) {
      case "left":
        r = h / 2;
        path = `m${r},${0} h${w - r} v-${h} h-${w - r} a${r},${r} 0 0,0 0,${h} z`;
        break;
      case "right":
        r = h / 2;
        c = { x: x + w - r, y: y + r };
        s = { x: x, y: y };
        break;
      default:
        console.error("Invalid and path direction");
    }

    this.obj = this.owner.drawing.path(path)
      .attr({
        "fill-opacity": 0.0,
        "stroke-opacity": 1.0,
        "stroke": "#000",
      })
      .x(x)
      .y(y);
  }

  draw() {
    let loc = this.convertRelativeToPixels(this.x, this.y);
    let size = this.convertRelativeToPixels(this.width, this.height);
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
        break;
      case SHAPE.AND:
        this.get_and_path(loc.x, loc.y, size.x, size.y, "left");
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
    }

    this.obj = this.obj.attr({ "id": `shape_${this.count}` });
    if (this.onclick) this.obj.click(this.onclick);
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
      .font("anchor", "middle")
      .font("weight", "bold")
      .font("size", 12)
      .font("family", "sans-serif")

    //let top_bar = 
    if (this.tooltipEl) {
      this.tooltipEl.style.top = `${loc.y}px`;
      this.tooltipEl.style.left = `${loc.x}px`;
    }
    let bbox = this.text.node.getBoundingClientRect();
    let h = (bbox.height);
    this.text = this.text
      .y(center.y - h / 2);

    this.connectors.forEach(c => c.draw());
  }
}

export { Component, Connector, SHAPE, PATH_WIDTH };
