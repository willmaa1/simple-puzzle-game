
import { assetsPath, pathJoin } from "./utils.js";
import { Point, PieceQubicBezierPath } from "./bezier.js";
import { playSnap } from "./audio.js";

const defaultImg = "bubbles.jpg";

class Piece {
  // up, right, down, left
  sides = [0, 0, 0, 0]; // -1 in // 0 = flat, 1 = out
  elem = new Image();
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

class Puzzle {
  rows = 10;
  columns = 10;
  pieces = [];
  puzImg = document.createElement("img");
  constructor() {
    this.puzImg.onerror = this.afterLoadError;
    this.puzImg.onload = this.afterLoad;
  }

  removePieces = () => {
    for(const row of this.pieces) {
      for (const piece of row) {
        piece.elem.remove();
      }
    }
    this.pieces = [];
  }

  changeDimensions = (rows, columns) => {
    this.rows = rows;
    this.columns = columns;
  }

  defaultPuzzle = () => {
    this.changeImage(pathJoin([assetsPath, defaultImg]));
  }

  changeImage = (src) => {
    this.puzImg.src = src;
  }

  afterLoadError = (e) => {
    console.log("oops, some error in loading the image");
  }

  afterLoad = (e) => {
    this.cutPieces();
  }

  cutPieces = () => {
    if (!this.puzImg.complete || this.puzImg.naturalHeight === 0) {
      console.warn("No valid puzzle image loaded...");
    }
    this.pieces = [];

    const piecesElem = document.getElementById("pieces");
    const h = this.puzImg.naturalHeight;
    const w = this.puzImg.naturalWidth;
    const ph = Math.floor(h/this.rows);
    const pw = Math.floor(w/this.columns);
    let imgElemScaler = 1;
    if (h/w > piecesElem.clientHeight/piecesElem.clientWidth) {
      imgElemScaler = piecesElem.clientHeight /h*0.9;
    } else {
      imgElemScaler = piecesElem.clientWidth /w*0.9;
    }
    
    
    // console.log(h, ph, w, pw);

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
    
    // clipPieces = () => {
    for (let r = 0; r < this.pieces.length; r++) {
      for (let c = 0; c < this.pieces[r].length; c++) {

        const piece = this.pieces[r][c];
        const startY = r * ph;
        const startX = c * pw;

        // const points = [];
        // for (let pp = 0; pp < 11; pp++) {
        //   points.push(new Point(Math.floor(Math.random()*pw), Math.floor(Math.random()*ph)));
        // }
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

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        ctx.strokeStyle = "black";
        ctx.lineWidth = 5;
        canvas.width = w;
        canvas.height = h;
        ctx.save();
        ctx.clearRect(minX, minY, maxWidth, maxHeight);
        ctx.beginPath();

        ctx.moveTo(top.start.x, top.start.y);


        for (let pathpart of listed) {
          // console.log(listed)
          for (let qb of pathpart.qbparts) {
            // console.log(qb[1].x, qb[1].y);
            ctx.quadraticCurveTo(qb[0].x, qb[0].y, qb[1].x, qb[1].y);
          }
        }

        ctx.stroke(); // Not necessary! Only adds black line on the path...
        // ctx.imageSmoothingEnabled=false;
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(this.puzImg, 0, 0);
        // ctx.fillRect(0,0,pw,ph);
        ctx.restore();

        const canvas2=document.createElement('canvas');
        const ctx2=canvas2.getContext('2d');
        canvas2.width=maxWidth;
        canvas2.height=maxHeight;

        ctx2.drawImage(canvas, minX,minY,maxWidth,maxHeight, 0,0,maxWidth,maxHeight);
        
        const clippedImage = new Image();
        clippedImage.src=canvas2.toDataURL();
        clippedImage.className = "piece";
        // console.log(minX, minY);
        // Initial offset of the pieces is 2% so they are not immediately on the border.
        clippedImage.style.left = `${2 + minX/(pw*this.columns)*95}%`;
        clippedImage.style.top = `${2 + minY/(ph*this.rows)*95}%`;
        // clippedImage.style.left = `${2 + (pw*c)/w*94}%`;
        // clippedImage.style.top = `${2 + (ph*r)/h*94}%`;
        clippedImage.style.width = `${maxWidth*imgElemScaler}px`;
        clippedImage.style.height = `${maxHeight*imgElemScaler}px`;
        // clippedImage.wid
        piece.elem = clippedImage;
        clippedImage.onmouseenter = (e) => {
          allowedPieces.push(piece);
          console.log(allowedPieces);
        }
        clippedImage.onmouseleave = (e) => {
          for (let i = 0; i < allowedPieces.length; i++) {
            if (allowedPieces[i] === piece) {
              allowedPieces.splice(i, 1);
              break;
            }
          }
          console.log(allowedPieces);
        }
      }
    }
    const shuffledPieces = this.pieces.flat(1);
    shuffledPieces.sort((a,b)=> { return Math.random()-0.5; }); // More randomness...
    for (const piece of shuffledPieces) {
      const swapi = Math.floor(Math.random()*shuffledPieces.length);
      const otherpiece = shuffledPieces[swapi];
      const tempLeft = otherpiece.elem.style.left;
      const tempTop = otherpiece.elem.style.top;
      otherpiece.elem.style.left = piece.elem.style.left;
      otherpiece.elem.style.top = piece.elem.style.top;
      piece.elem.style.left = tempLeft;
      piece.elem.style.top = tempTop;
    }
    for (const piece of shuffledPieces) {
      document.getElementById("pieces").appendChild(piece.elem);
    }
    for (const piece of shuffledPieces) {
      piece.elem.style.left = `${piece.elem.offsetLeft}px`;
      piece.elem.style.top = `${piece.elem.offsetTop}px`;
    }
  }
  
  showPuzzleBackground = () => {
    const bg = document.getElementById("background");
    bg.style.backgroundImage = `url("${this.puzImg.src}")`;
  }
}


let xstart = 0;
let ystart = 0;
let xpiecestart = 0;
let ypiecestart = 0;
let movingPiece = null;
let zindex = 0;

function removePx(pxString) {
  return Number(pxString.slice(0,-2));
}

document.addEventListener("mousedown", (e) => {
  e.preventDefault();
  // Right click
  if (e.button === 0) {
    xstart = e.clientX;
    ystart = e.clientY;
    if (allowedPieces.length === 1) {
      movingPiece = allowedPieces[0];
      xpiecestart = removePx(movingPiece.elem.style.left);
      ypiecestart = removePx(movingPiece.elem.style.top);
      zindex++;
      for (const piece of movingPiece.pieceGroup.pieces) {
        piece.elem.style.zIndex = zindex;
      }
    }
  }
  // console.log("mdown",movingPiece);
});

document.addEventListener("mousemove", (e) => {
  if (movingPiece != null) {
    const xend = e.clientX;
    const yend = e.clientY;

    // movingPiece.elem.y - ypiecestart;
    // movingPiece.elem.x - xpiecestart;
    
    // const finalTopDiff = (ypiecestart - movingPiece.elem.offsetTop) + (yend - ystart);
    // const finalLeftDiff = movingPiece.elem.offsetLeft + (xend - xstart) - xpiecestart;
    // console.log(finalTopDiff, finalLeftDiff, ypiecestart, movingPiece.elem.offsetTop, yend, ystart);
    // for (const piece of movingPiece.pieceGroup.pieces) {
    //   piece.elem.style.top = `${piece.elem.offsetTop + finalTopDiff}px`;
    //   piece.elem.style.left = `${piece.elem.offsetLeft + finalLeftDiff}px`;
    // }

    const finalTopDiff = (yend - ystart) - (removePx(movingPiece.elem.style.top) - ypiecestart);
    const finalLeftDiff = (xend - xstart) - (removePx(movingPiece.elem.style.left) - xpiecestart);
    // const finalLeftDiff = endLeft - movingPiece.elem.offsetLeft;
    for (const piece of movingPiece.pieceGroup.pieces) {
      piece.elem.style.top = `${removePx(piece.elem.style.top) + finalTopDiff}px`;
      piece.elem.style.left = `${removePx(piece.elem.style.left) + finalLeftDiff}px`;
    }
    // movingPiece.elem.style.top = `${ypiecestart + (yend-ystart)}px`;
    // movingPiece.elem.style.left = `${xpiecestart + (xend-xstart)}px`;
  }
})

document.addEventListener("mouseup", (e) => {

  // Right click
  // console.log("u2p",movingPiece);
  if (e.button === 0) {
    if (movingPiece != null) {
      console.log(movingPiece.row, movingPiece.column);
      
      const hh = removePx(movingPiece.elem.style.height);
      const ww = removePx(movingPiece.elem.style.width);
      
      const xend = e.clientX;
      const yend = e.clientY;
      let endTop = ypiecestart + (yend-ystart);
      let endLeft = xpiecestart + (xend-xstart);

      function updateEndPoint(targetX, targetY) {
        let withinTargetX = Math.abs(endLeft - targetX) < (ww*0.3);
        let withinTargetY = Math.abs(endTop - targetY) < (hh*0.3);
        let isWithin = withinTargetX && withinTargetY;
        if (isWithin) {
          endTop = targetY;
          endLeft = targetX;
          playSnap(); // Maybe this should be played elsewhere?
        }
        return isWithin;
      }
      let isWithin = false;
      let otherPiece = null;
      if (!isWithin && movingPiece.row !== 0 && currentPuzzle.rows >= 2) {
        // Check if top aligned
        otherPiece = currentPuzzle.pieces[movingPiece.row-1][movingPiece.column];
        const targetX = removePx(otherPiece.elem.style.left) + otherPiece.fromLeftScaled() - movingPiece.fromLeftScaled();
        const targetY = removePx(otherPiece.elem.style.top) + removePx(otherPiece.elem.style.height) + otherPiece.fromBottomScaled() - movingPiece.fromTopScaled();
        isWithin = !movingPiece.pieceGroup.isInGroup(otherPiece) && updateEndPoint(targetX, targetY, otherPiece);
      }
      if (!isWithin && movingPiece.row < currentPuzzle.rows-1) {
        // Check if bottom piece aligned
        otherPiece = currentPuzzle.pieces[movingPiece.row+1][movingPiece.column];
        const targetX = removePx(otherPiece.elem.style.left) + otherPiece.fromLeftScaled() - movingPiece.fromLeftScaled();
        const targetY = removePx(otherPiece.elem.style.top) - removePx(movingPiece.elem.style.height) + otherPiece.fromTopScaled() - movingPiece.fromBottomScaled();
        isWithin = !movingPiece.pieceGroup.isInGroup(otherPiece) && updateEndPoint(targetX, targetY);
      }
      if (!isWithin && movingPiece.column < currentPuzzle.columns-1) {
        // Check if right aligned
        otherPiece = currentPuzzle.pieces[movingPiece.row][movingPiece.column+1];
        const targetX = removePx(otherPiece.elem.style.left) - removePx(movingPiece.elem.style.width) + otherPiece.fromLeftScaled() - movingPiece.fromRightScaled();
        const targetY = removePx(otherPiece.elem.style.top) + otherPiece.fromTopScaled() - movingPiece.fromTopScaled();
        isWithin = !movingPiece.pieceGroup.isInGroup(otherPiece) && updateEndPoint(targetX, targetY);
      }
      if (!isWithin && movingPiece.column !== 0 && currentPuzzle.columns >= 2) {
        // Check if left aligned
        otherPiece = currentPuzzle.pieces[movingPiece.row][movingPiece.column-1];
        const targetX = removePx(otherPiece.elem.style.left) + removePx(otherPiece.elem.style.width) + otherPiece.fromRightScaled() - movingPiece.fromLeftScaled();
        const targetY = removePx(otherPiece.elem.style.top) + otherPiece.fromTopScaled() - movingPiece.fromTopScaled();
        // console.log(isWithin, targetY, targetX, endTop, endLeft)
        isWithin = !movingPiece.pieceGroup.isInGroup(otherPiece) && updateEndPoint(targetX, targetY);
        // console.log(isWithin, targetY, targetX, endTop, endLeft)
      }


      // movingPiece.elem.style.top = `${endTop}px`;
      // movingPiece.elem.style.left = `${endLeft}px`;

      const finalTopDiff = endTop - removePx(movingPiece.elem.style.top);
      const finalLeftDiff = endLeft - removePx(movingPiece.elem.style.left);
      for (const piece of movingPiece.pieceGroup.pieces) {
        piece.elem.style.top = `${removePx(piece.elem.style.top) + finalTopDiff}px`;
        piece.elem.style.left = `${removePx(piece.elem.style.left) + finalLeftDiff}px`;
      }
      
      if (isWithin && otherPiece != null) {
        movingPiece.changeGroupTo(otherPiece.pieceGroup); 
      }

      movingPiece = null;
    }
  }
});


const allowedPieces = []

export const currentPuzzle = new Puzzle();

export function createNewPuzzle(rows, columns, src = "") {
  currentPuzzle.removePieces();
  allowedPieces.splice(0, allowedPieces.length);
  currentPuzzle.changeDimensions(rows, columns);
  if (src == "") {
    currentPuzzle.defaultPuzzle();
  } else {
    currentPuzzle.changeImage(src);
  }
  currentPuzzle.showPuzzleBackground();
}