export class Point {
  x = 0;
  y = 0;
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  flipXAxis = () => { this.y *= -1; }
  flipYAxis = () => { this.x *= -1; }
  scale = (multiplier) => { this.x *= multiplier; this.y *= multiplier; }
  minus = (that) => { this.x -= that.x; this.y -= that.y; }
  difference = (that) => { return new Point(this.x - that.x, this.y - that.y); }
  midpoint = (that) => { return new Point(this.x + (that.x - this.x)/2, this.y + (that.y - this.y)/2); }
  rotateRight = () => {
    const tempx = this.x;
    this.x = this.y*-1;
    this.y = tempx;
  }
  rotateLeft = () => {
    const tempx = this.x;
    this.x = this.y;
    this.y = tempx*-1;
  }
}
// Inspiration and original format from:
//https://stackoverflow.com/questions/30617132/jigsaw-puzzle-pices-using-bezier-curve
export class PieceQubicBezierPath {
  start = new Point(-50,0);
  // qbparts = [ // This version left and right shoulders are slightly different
  //   [new Point(-5, 30), new Point(-13,5)],
  //   [new Point(-10, 0), new Point(-12,-5)],
  //   [new Point(-30, -20), new Point(0,-20)],
  //   [new Point(30, -20), new Point(12,-5)],
  //   [new Point(10, 0), new Point(13,5)],
  //   [new Point(15, 15), new Point(50,0)]
  // ]
  qbparts = [ // Original version centered around 0
    [new Point(-15, 15), new Point(-13,5)],
    [new Point(-10, 0), new Point(-12,-5)],
    [new Point(-30, -20), new Point(0,-20)],
    [new Point(30, -20), new Point(12,-5)],
    [new Point(10, 0), new Point(13,5)],
    [new Point(15, 15), new Point(50,0)]
  ]
  // qbpartsOriginal = [
  //   [new Point(35, 15), new Point(37,5)],
  //   [new Point(40, 0), new Point(38,-5)],
  //   [new Point(20, -20), new Point(50,-20)],
  //   [new Point(80, -20), new Point(62,-5)],
  //   [new Point(60, 0), new Point(63,5)],
  //   [new Point(65, 15), new Point(100,0)]
  // ]
  constructor(){}
  setStraight = () => {
    this.qbparts = [[this.end().midpoint(this.start), this.end()]];
  }
  setStart = (point = new Point(-50,0)) => {
    const diff = this.start.difference(point);
    this.start.x = point.x;
    this.start.y = point.y;
    for (let i = 0; i < this.qbparts.length; i++) {
      this.qbparts[i][0].minus(diff);
      this.qbparts[i][1].minus(diff);
    }
  }
  end = () => {
    return this.qbparts[this.qbparts.length-1][1]
  }
  flipYAxis = () => {
    this.start.flipYAxis();
    for (let i = 0; i < this.qbparts.length; i++) {
      this.qbparts[i][0].flipYAxis();
      this.qbparts[i][1].flipYAxis();
    }
    for (let i = 0; i < this.qbparts.length/2; i++) {
      const temp2 = this.qbparts[i];
      this.qbparts[i] = this.qbparts[this.qbparts.length-1-i];
      this.qbparts[this.qbparts.length-1-i] = temp2;
    }
    const temp = this.start;
    this.start = this.qbparts[0][1];
    for (let i = 1; i < this.qbparts.length; i++) {
      this.qbparts[i-1][1] = this.qbparts[i][1];
    }
    this.qbparts[this.qbparts.length-1][1] = temp;
    // this.qbparts[this.qbparts.length-1][1] = this.start;
    // this.start = temp;
  }
  flipXAxis = () => {
    this.start.flipXAxis();
    for (let i = 0; i < this.qbparts.length; i++) {
      this.qbparts[i][0].flipXAxis();
      this.qbparts[i][1].flipXAxis();
    }
  }

  flip = () => {
    this.flipXAxis();
    this.flipYAxis();
  }

  rotateLeft = () => {
    this.start.rotateLeft();
    for (let i = 0; i < this.qbparts.length; i++) {
      this.qbparts[i][0].rotateLeft();
      this.qbparts[i][1].rotateLeft();
    }
  }
  rotateRight = () => {
    this.start.rotateRight();
    for (let i = 0; i < this.qbparts.length; i++) {
      this.qbparts[i][0].rotateRight();
      this.qbparts[i][1].rotateRight();
    }
  }
  _minmaxNaive = (min = true, x = true) => {
    // Uses the control points as the bounding box.
    // This WILL give too high and low values when the control point of bezier curve is not reached.
    let res = x ? this.start.x : this.start.y;
    for (let i = 0; i < this.qbparts.length; i++) {
      let next = x ? this.qbparts[i][0].x : this.qbparts[i][0].y;
      res = min ? Math.min(res, next) : Math.max(res, next);
      next = x ? this.qbparts[i][1].x : this.qbparts[i][1].y;
      res = min ? Math.min(res, next) : Math.max(res, next);
    }
    return res;
  }

  _minmax = (min = true, x = true) => {
    let minx = Infinity;
    let miny = Infinity;
    let maxx = 0;
    let maxy = 0;
    let res;
    for (let i = 0; i < this.qbparts.length; i++) {
      if (i === 0) {
        res = quadraticCurveBoundary(this.start.x, this.start.y,
                                    this.qbparts[0][0].x, this.qbparts[0][0].y,
                                    this.qbparts[0][1].x, this.qbparts[0][1].y);
      } else {
        res = quadraticCurveBoundary(this.qbparts[i-1][1].x, this.qbparts[i-1][1].y,
                                    this.qbparts[i][0].x, this.qbparts[i][0].y,
                                    this.qbparts[i][1].x, this.qbparts[i][1].y);
      }
      minx = Math.min(minx, res.x);
      miny = Math.min(miny, res.y);
      maxx = Math.max(maxx, res.x + res.width);
      maxy = Math.max(maxy, res.y + res.height);
    }

    // Add one pixel padding
    if (x) {
      return min ? minx -1 : maxx +1;
    } else {
      return min ? miny -1 : maxy +1;
    }
  }

  maxX = () => {
    return this._minmax(false, true);
  }
  minX = () => {
    return this._minmax(true, true);
  }
  maxY = () => {
    return this._minmax(false, false);
  }
  minY = () => {
    return this._minmax(true, false);
  }

  setLength = (length = 100) => {
    // Assume the length has not been changed and is still 100
    const lengthCurrent = 100;
    const lengthChange = length/lengthCurrent;
    this.start.scale(lengthChange);
    for (let i = 0; i < this.qbparts.length; i++) {
      this.qbparts[i][0].scale(lengthChange);
      this.qbparts[i][1].scale(lengthChange);
    }
  }
}


// const ShouldersAndHeadCubicBezierControlPoints=[
//   {cx1:0,  cy1:0,  cx2:35,cy2:15, ex:37, ey:5},   // left shoulder
//   {cx1:37, cy1:5,  cx2:40,cy2:0,  ex:38, ey:-5},  // left neck
//   {cx1:38, cy1:-5, cx2:20,cy2:-20,ex:50, ey:-20}, // left head
//   {cx1:50, cy1:-20,cx2:80,cy2:-20,ex:62, ey:-5},  // right head
//   {cx1:62, cy1:-5, cx2:60,cy2:0,  ex:63, ey:5},   // right neck
//   {cx1:63, cy1:5,  cx2:65,cy2:15, ex:100,ey:0},   // right shoulder
// ];

// Modified code for approximating bezier curve boundary from
// https://stackoverflow.com/questions/18141190/how-to-calculate-width-height-and-position-of-bezier-curve/20937454#20937454
function quadraticCurveBoundary(ax, ay, bx, by, cx, cy) {
  let tobx = bx - ax;
  let toby = by - ay;
  let tocx = cx - bx;
  let tocy = cy - by;

  let steps = 40;
  let precision = 1 / steps;    // precission

  let d, px, py, qx, qy, x, y, toqx, toqy;
  let minx = Infinity;
  let miny = Infinity;
  let maxx = 0;
  let maxy = 0;

  for (let i = 0; i < steps; i++) {
    d = i * precision;
    px = ax + d * tobx;
    py = ay + d * toby;
    qx = bx + d * tocx;
    qy = by + d * tocy;

    toqx = qx - px;
    toqy = qy - py;

    x = px + d * toqx;
    y = py + d * toqy;

    minx = Math.min(minx, x);
    miny = Math.min(miny, y);
    maxx = Math.max(maxx, x);
    maxy = Math.max(maxy, y);
  }
  return {x: Math.round(minx), y: Math.round(miny), width: Math.round(maxx - minx), height: Math.round(maxy - miny)};
}
