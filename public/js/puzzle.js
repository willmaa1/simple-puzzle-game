
import { removePx } from "./utils.js";
import { Point, PieceQubicBezierPath } from "./bezier.js";

class Piece {
  // up, right, down, left
  sides = [0, 0, 0, 0]; // -1 in // 0 = flat, 1 = out
  elem = document.createElement("canvas");
  row = 0;
  column = 0;
  top = new PieceQubicBezierPath();
  right = new PieceQubicBezierPath();
  bottom = new PieceQubicBezierPath();
  left = new PieceQubicBezierPath();
  constructor(sides, row=0, column=0) {
    this.sides = sides;
    this.row = row;
    this.column = column;
    this.elem.className = "piece";
  }
  height = 0;
  width = 0;
  fullheight = 0;
  fullwidth = 0;
  pieceGroup = new PieceGroup(this);
  getTop = () => {
    return this.sides[0];
  }
  getRight = () => {
    return this.sides[1];
  }
  getBottom = () => {
    return this.sides[2];
  }
  getLeft = () => {
    return this.sides[3];
  }
  fromTop = () => {
    return this.top.start.y - this.top.minY();
  }
  fromRight = () => {
    return this.right.start.x - this.right.maxX();
  }
  fromBottom = () => {
    return this.bottom.start.y - this.bottom.maxY();
  }
  fromLeft = () => {
    return this.left.start.x - this.left.minX();
  }
  fromTopScaled = () => {
    return removePx(this.elem.style.height)/this.fullheight*this.fromTop();
  }
  fromRightScaled = () => {
    return removePx(this.elem.style.width)/this.fullwidth*this.fromRight();
  }
  fromBottomScaled = () => {
    return removePx(this.elem.style.height)/this.fullheight*this.fromBottom();
  }
  fromLeftScaled = () => {
    return removePx(this.elem.style.width)/this.fullwidth*this.fromLeft();
  }
  changeGroupTo = (group) => {
    if (this.pieceGroup === group)
      return;
    const oldGroup = this.pieceGroup;
    for (const piece of this.pieceGroup.pieces) {
      piece.pieceGroup = group;
      group.addPiece(piece);
    }
    oldGroup.pieces = [];
  }
}

class PieceGroup {
  pieces = [];
  constructor(piece = new Piece([0,0,0,0], 0, 0)){
    this.pieces.push(piece);
  }
  addPiece = (piece) => {
    this.pieces.push(piece)
  }
  isInGroup = (piece) => {
    return this.pieces.includes(piece);
  }
}

export class Puzzle {
  pieceMultiplier = 1;
  rows = 10;
  columns = 10;
  pieces = [];
  puzImg = new Image();
  containerWidth = 1920;
  containerHeight = 1080;
  onready;
  constructor(pieceMultiplier, containerWidth, containerHeight, src, onready) {
    this.pieceMultiplier = pieceMultiplier;
    this.containerWidth = containerWidth;
    this.containerHeight = containerHeight;
    this.onready = onready;
    this.puzImg.onerror = this._afterLoadError;
    this.puzImg.onload = this._afterLoad;
    this.puzImg.src = src;
  }

  isComplete = () => {
    return this.rows * this.columns === this.pieces[0][0].pieceGroup.pieces.length;
  }

  _afterLoadError = (e) => {
    console.log("oops, some error in loading the image");
  }

  _afterLoad = (e) => {
    this._calculateDimensions();
    this._createPieces();
    this._cutPieces();
    if (typeof this.onready === "function") {
      this.onready();
    }
  }

  _calculateDimensions = () => {
    const h = this.puzImg.naturalHeight;
    const w = this.puzImg.naturalWidth;
    const rowMultiplier = Math.sqrt(h / w);
    this.rows = Math.floor(2 + (this.pieceMultiplier*0.8 + Math.random()*0.2) * rowMultiplier);
    this.columns = Math.floor(2 + (this.pieceMultiplier*0.8 + Math.random()*0.2) / rowMultiplier);
    console.log("Rows:", this.rows, "Columns:", this.columns, "Total pieces:", this.rows * this.columns);
  }

  _createPieces = () => {
    function randomInOut() {
      return [1, -1][Math.floor(Math.random()*2)];
    }

    for(let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.columns; c++) {
        let sides = [0, 0, 0, 0];

        if (r === 0) {
          sides[0] = 0; // flat top
        } else {
          sides[0] = this.pieces[r-1][c].getBottom() * -1; // previous bottom dictates current bottom
        }
        if (c === this.columns-1) {
          sides[1] = 0; // flat right
        } else {
          sides[1] = randomInOut();
        }
        if (r === this.rows-1) {
          sides[2] = 0; // flat bottom
        } else {
          sides[2] = randomInOut();
        }
        if (c === 0) {
          sides[3] = 0; // flat left
        } else {
          sides[3] = this.pieces[r][c-1].getRight() * -1; // previous top dictates current bottom
        }

        // Create new subarray for each row (eg. we are in column 0)
        if (c === 0) {
          this.pieces.push([]);
        }

        this.pieces[r].push(new Piece(sides, r, c));
        // console.log(sides);
      }
    }
  }

  _cutPieces = () => {
    if (!this.puzImg.complete || this.puzImg.naturalHeight === 0) {
      console.warn("No valid puzzle image loaded...");
    }

    const h = this.puzImg.naturalHeight;
    const w = this.puzImg.naturalWidth;
    const ph = Math.floor(h/this.rows);
    const pw = Math.floor(w/this.columns);
    let imgElemScaler = 1;
    if (h/w > this.containerHeight/this.containerWidth) {
      imgElemScaler = this.containerHeight / h *0.9;
    } else {
      imgElemScaler = this.containerWidth / w *0.9;
    }
    
    
    // console.log(h, ph, w, pw);

    // Predefine canvas for drawing image
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    canvas.width = w;
    canvas.height = h;

    // clipPieces = () => {
    for (let r = 0; r < this.pieces.length; r++) {
      for (let c = 0; c < this.pieces[r].length; c++) {

        const piece = this.pieces[r][c];
        const startY = r * ph;
        const startX = c * pw;

        const top = new PieceQubicBezierPath();
        const right = new PieceQubicBezierPath();
        const bottom = new PieceQubicBezierPath();
        const left = new PieceQubicBezierPath();
        piece.top = top;
        piece.right = right;
        piece.bottom = bottom;
        piece.left = left;
        piece.height = ph;
        piece.width = pw;

        if (piece.sides[0] === 0)
          top.setStraight();
        else if (piece.sides[0] === -1)
          top.flip();
        top.setLength(pw);
        top.setStart(new Point(startX, startY));
        if (piece.sides[1] === 0)
          right.setStraight();
        else if (piece.sides[1] === -1)
          right.flip();
        right.rotateRight();
        right.setLength(ph);
        right.setStart(top.end());
        if (piece.sides[2] === 0)
          bottom.setStraight();
        else if (piece.sides[2] === -1)
          bottom.flip();
        bottom.rotateLeft();
        bottom.rotateLeft();
        bottom.setLength(pw);
        bottom.setStart(right.end());
        if (piece.sides[3] === 0)
          left.setStraight();
        else if (piece.sides[3] === -1)
          left.flip();
        left.rotateLeft();
        left.setLength(ph);
        left.setStart(bottom.end());


        const listed = [top, right, bottom, left];
        const maxWidth = Math.abs(left.minX() - right.maxX());
        const maxHeight = Math.abs(top.minY() - bottom.maxY());
        piece.fullwidth = maxWidth;
        piece.fullheight = maxHeight;
        const minX = left.minX();
        const minY = top.minY();
        // let min = [left.minX(), top.minY()];
        // let max = [right.maxX(), bottom.maxY()];
        // for (let pathpart of listed) {
        //   console.log(pathpart.minX(), pathpart.minY(), pathpart.maxX(), pathpart.maxY());
        // }

        ctx.save();
        // Clear entire canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // ctx.clearRect(minX, minY, maxWidth, maxHeight);
        ctx.beginPath();

        ctx.moveTo(top.start.x, top.start.y);


        for (let pathpart of listed) {
          // console.log(listed)
          for (let qb of pathpart.qbparts) {
            // console.log(qb[1].x, qb[1].y);
            ctx.quadraticCurveTo(qb[0].x, qb[0].y, qb[1].x, qb[1].y);
          }
        }

        ctx.stroke(); // Adds black line for edges
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(this.puzImg, 0, 0);
        ctx.restore();
  
        // Setting canvas width or height clears canvas so we can re-use old canvas object.
        const canvas2 = piece.elem;
        const ctx2 = canvas2.getContext('2d');
        canvas2.width = maxWidth;
        canvas2.height = maxHeight;

        ctx2.drawImage(canvas, minX, minY, maxWidth, maxHeight, 0, 0, maxWidth, maxHeight);

        const clippedImage = piece.elem;

        // console.log(minX, minY);
        // Initial offset of the pieces is 2% so they are not immediately on the border.
        clippedImage.style.position = "absolute";
        clippedImage.style.left = `${2 + minX/(pw*this.columns)*95}%`;
        clippedImage.style.top = `${2 + minY/(ph*this.rows)*95}%`;
        // clippedImage.style.left = `${2 + (pw*c)/w*94}%`;
        // clippedImage.style.top = `${2 + (ph*r)/h*94}%`;
        clippedImage.style.width = `${maxWidth*imgElemScaler}px`;
        clippedImage.style.height = `${maxHeight*imgElemScaler}px`;
      }
    }
  }
}

