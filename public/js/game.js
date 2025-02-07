import { playSnap } from "./audio.js";
import { defaultImg, getRandomCustomImage, loadCustomImages } from "./imgloader.js";
import { Puzzle } from "./puzzle.js";
import { pathJoin, assetsPath, removePx } from "./utils.js";

class Game {
  currentPuzzle;
  // Variables for handling piece movement
  xStart = 0;
  yStart = 0;
  xPieceStart = 0;
  yPieceStart = 0;
  movingPiece = null;
  zIndex = 0;
  allowedPieces = [];

  constructor(){
    this.addEventListeners();
  }

  changePuzzle = (src = "") => {
    const size = [1.5,2,3][Math.floor(Math.random()*3)];
    const columns = Math.floor((3 + Math.floor(Math.random()))*size);
    const rows = Math.floor((3 + Math.floor(Math.random()))*size);

    // Clear old pieces
    const piecesElem = document.getElementById("pieces");
    piecesElem.replaceChildren();
    this.allowedPieces = [];

    if (src == "") {
      src = pathJoin([assetsPath, defaultImg]);
    }
    this.currentPuzzle = new Puzzle(rows, columns, piecesElem.clientWidth, piecesElem.clientHeight, src, this.addPieces)

    // this.addPieces();
    this.showPuzzleBackground();
  }

  addPieces = () => {
    const shuffledPieces = this.currentPuzzle.pieces.flat(1);
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
      piece.elem.onmouseenter = (e) => {
        this.allowedPieces.push(piece);
        // console.log(this.allowedPieces);
      }
      piece.elem.onmouseleave = (e) => {
        for (let i = 0; i < this.allowedPieces.length; i++) {
          if (this.allowedPieces[i] === piece) {
            this.allowedPieces.splice(i, 1);
            break;
          }
        }
        // console.log(this.allowedPieces);
      }
    }
    for (const piece of shuffledPieces) {
      piece.elem.style.left = `${piece.elem.offsetLeft}px`;
      piece.elem.style.top = `${piece.elem.offsetTop}px`;
    }
  }
  
  showPuzzleBackground = () => {
    const bg = document.getElementById("background");
    bg.style.backgroundImage = `url("${this.currentPuzzle.puzImg.src}")`;
  }

  addEventListeners = () => {
    document.addEventListener("mousedown", this.mousedownListener);
    document.addEventListener("mousemove", this.mousemoveListener);
    document.addEventListener("mouseup", this.mouseupListener);
  }

  removeEventListeners = () => {
    document.removeEventListener("mousedown", this.mousedownListener);
    document.removeEventListener("mousemove", this.mousemoveListener);
    document.removeEventListener("mouseup", this.mouseupListener);
  }

  mousedownListener = (e) => {
    e.preventDefault();
    // Right click
    if (e.button === 0) {
      this.xStart = e.clientX;
      this.yStart = e.clientY;
      if (this.allowedPieces.length === 1) {
        this.movingPiece = this.allowedPieces[0];
        this.xPieceStart = removePx(this.movingPiece.elem.style.left);
        this.yPieceStart = removePx(this.movingPiece.elem.style.top);
        this.zIndex++;
        for (const piece of this.movingPiece.pieceGroup.pieces) {
          piece.elem.style.zIndex = this.zIndex;
        }
      }
    }
    // console.log("mdown",movingPiece);
  }

  mousemoveListener = (e) => {
    if (this.movingPiece != null) {
      const xend = e.clientX;
      const yend = e.clientY;
  
      // this.movingPiece.elem.y - this.yPieceStart;
      // this.movingPiece.elem.x - this.xPieceStart;
      
      // const finalTopDiff = (yPieceStart - this.movingPiece.elem.offsetTop) + (yend - this.yStart);
      // const finalLeftDiff = this.movingPiece.elem.offsetLeft + (xend - this.xStart) - this.xPieceStart;
      // console.log(finalTopDiff, finalLeftDiff, this.yPieceStart, this.movingPiece.elem.offsetTop, yend, this.yStart);
      // for (const piece of this.movingPiece.pieceGroup.pieces) {
      //   piece.elem.style.top = `${piece.elem.offsetTop + finalTopDiff}px`;
      //   piece.elem.style.left = `${piece.elem.offsetLeft + finalLeftDiff}px`;
      // }
  
      const finalTopDiff = (yend - this.yStart) - (removePx(this.movingPiece.elem.style.top) - this.yPieceStart);
      const finalLeftDiff = (xend - this.xStart) - (removePx(this.movingPiece.elem.style.left) - this.xPieceStart);
      // const finalLeftDiff = endLeft - this.movingPiece.elem.offsetLeft;
      for (const piece of this.movingPiece.pieceGroup.pieces) {
        piece.elem.style.top = `${removePx(piece.elem.style.top) + finalTopDiff}px`;
        piece.elem.style.left = `${removePx(piece.elem.style.left) + finalLeftDiff}px`;
      }
      // this.movingPiece.elem.style.top = `${yPieceStart + (yend - this.yStart)}px`;
      // this.movingPiece.elem.style.left = `${xPieceStart + (xend - this.xStart)}px`;
    }
  }

  mouseupListener = (e) => {
    // Right click
    // console.log("u2p",movingPiece);
    if (e.button === 0) {
      if (this.movingPiece != null) {
        // console.log(this.movingPiece.row, this.movingPiece.column);
        
        const hh = removePx(this.movingPiece.elem.style.height);
        const ww = removePx(this.movingPiece.elem.style.width);
        
        const xend = e.clientX;
        const yend = e.clientY;
        let endTop = this.yPieceStart + (yend - this.yStart);
        let endLeft = this.xPieceStart + (xend - this.xStart);
  
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
        if (!isWithin && this.movingPiece.row !== 0 && this.currentPuzzle.rows >= 2) {
          // Check if top aligned
          otherPiece = this.currentPuzzle.pieces[this.movingPiece.row-1][this.movingPiece.column];
          const targetX = removePx(otherPiece.elem.style.left) + otherPiece.fromLeftScaled() - this.movingPiece.fromLeftScaled();
          const targetY = removePx(otherPiece.elem.style.top) + removePx(otherPiece.elem.style.height) + otherPiece.fromBottomScaled() - this.movingPiece.fromTopScaled();
          isWithin = !this.movingPiece.pieceGroup.isInGroup(otherPiece) && updateEndPoint(targetX, targetY, otherPiece);
        }
        if (!isWithin && this.movingPiece.row < this.currentPuzzle.rows-1) {
          // Check if bottom piece aligned
          otherPiece = this.currentPuzzle.pieces[this.movingPiece.row+1][this.movingPiece.column];
          const targetX = removePx(otherPiece.elem.style.left) + otherPiece.fromLeftScaled() - this.movingPiece.fromLeftScaled();
          const targetY = removePx(otherPiece.elem.style.top) - removePx(this.movingPiece.elem.style.height) + otherPiece.fromTopScaled() - this.movingPiece.fromBottomScaled();
          isWithin = !this.movingPiece.pieceGroup.isInGroup(otherPiece) && updateEndPoint(targetX, targetY);
        }
        if (!isWithin && this.movingPiece.column < this.currentPuzzle.columns-1) {
          // Check if right aligned
          otherPiece = this.currentPuzzle.pieces[this.movingPiece.row][this.movingPiece.column+1];
          const targetX = removePx(otherPiece.elem.style.left) - removePx(this.movingPiece.elem.style.width) + otherPiece.fromLeftScaled() - this.movingPiece.fromRightScaled();
          const targetY = removePx(otherPiece.elem.style.top) + otherPiece.fromTopScaled() - this.movingPiece.fromTopScaled();
          isWithin = !this.movingPiece.pieceGroup.isInGroup(otherPiece) && updateEndPoint(targetX, targetY);
        }
        if (!isWithin && this.movingPiece.column !== 0 && this.currentPuzzle.columns >= 2) {
          // Check if left aligned
          otherPiece = this.currentPuzzle.pieces[this.movingPiece.row][this.movingPiece.column-1];
          const targetX = removePx(otherPiece.elem.style.left) + removePx(otherPiece.elem.style.width) + otherPiece.fromRightScaled() - this.movingPiece.fromLeftScaled();
          const targetY = removePx(otherPiece.elem.style.top) + otherPiece.fromTopScaled() - this.movingPiece.fromTopScaled();
          // console.log(isWithin, targetY, targetX, endTop, endLeft)
          isWithin = !this.movingPiece.pieceGroup.isInGroup(otherPiece) && updateEndPoint(targetX, targetY);
          // console.log(isWithin, targetY, targetX, endTop, endLeft)
        }
  
  
        // this.movingPiece.elem.style.top = `${endTop}px`;
        // this.movingPiece.elem.style.left = `${endLeft}px`;
  
        const finalTopDiff = endTop - removePx(this.movingPiece.elem.style.top);
        const finalLeftDiff = endLeft - removePx(this.movingPiece.elem.style.left);
        for (const piece of this.movingPiece.pieceGroup.pieces) {
          piece.elem.style.top = `${removePx(piece.elem.style.top) + finalTopDiff}px`;
          piece.elem.style.left = `${removePx(piece.elem.style.left) + finalLeftDiff}px`;
        }
        
        if (isWithin && otherPiece != null) {
          this.movingPiece.changeGroupTo(otherPiece.pieceGroup); 
        }
  
        this.movingPiece = null;
      }
    }
  }
}

export const game = new Game();


// Use "r" to fetch a new custom puzzle and "o" to open current image in new tab
document.addEventListener("keydown", (e) => {
  if (e.key === "r") {
    game.changePuzzle(getRandomCustomImage());
  } else if (e.key === "o") {
    window.open(game.currentPuzzle.puzImg.src);
  } else if (e.key === "l") {
    loadCustomImages();
  }
});
