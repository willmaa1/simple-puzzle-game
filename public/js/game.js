import { loadCustomSounds, playComplete, playSnap } from "./audio.js";
import { defaultImg, getCustomImage, loadCustomImages, maxCustomImage } from "./imgloader.js";
import { Puzzle } from "./puzzle.js";
import { pathJoin, assetsPath, removePx, getAverageRBG } from "./utils.js";

export class Game {
  currentPuzzle;
  // Variables for handling piece movement
  xStart = 0;
  yStart = 0;
  xPieceStart = 0;
  yPieceStart = 0;
  movingPiece = null;
  zIndex = 0;
  allowedPieces = [];
  customImage = -1;
  pieceMultiplier = 1;

  constructor(){
    loadCustomImages();
    loadCustomSounds();
    this._addEventListeners();
    this._changePuzzle("");
  }

  _customPuzzle = () => {
    let custImg = getCustomImage(this.customImage);
    this.customImage = custImg.index;
    this._changePuzzle(custImg.src);
  }

  randCustomPuzzle = () => {
    this.customImage = -1;
    this._customPuzzle();
  }

  nextCustomPuzzle = () => {
    this.customImage = this.customImage + 1;
    if (this.customImage > maxCustomImage()) {
      this.customImage = 0;
    }
    this._customPuzzle();
  }

  prevCustomPuzzle = () => {
    this.customImage = (this.customImage - 1);
    if (this.customImage < 0) {
      this.customImage = maxCustomImage();
    }
    this._customPuzzle();
  }

  increasePieces = () => {
    this.pieceMultiplier = Math.min(30, this.pieceMultiplier + 1);
    this._changePuzzle(this.currentPuzzle.puzImg.src);
  }

  decreasePieces = () => {
    this.pieceMultiplier = Math.max(1, this.pieceMultiplier - 1);
    this._changePuzzle(this.currentPuzzle.puzImg.src);
  }

  _changePuzzle = (src = "") => {
    // Clear old pieces
    const piecesElem = document.getElementById("pieces");
    piecesElem.replaceChildren();
    this.allowedPieces = [];

    if (src == "") {
      src = pathJoin([assetsPath, defaultImg]);
    }
    this.currentPuzzle = new Puzzle(this.pieceMultiplier, piecesElem.clientWidth, piecesElem.clientHeight, src, this._onPuzzleReady)
  }

  _onPuzzleReady = () => {
    this._showPuzzleBackground();
    this._addPieces();
  }

  _addPieces = () => {
    const shuffledPieces = this.currentPuzzle.pieces.flat(1);

    // Randomize the location of by ordering the pieces randomly
    // and then for each piece swapping its position with a random piece.
    shuffledPieces.sort((a,b)=> { return Math.random()-0.5; });
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
      // Add pieces to screen
      document.getElementById("pieces").appendChild(piece.elem);
      piece.elem.style.left = `${piece.elem.offsetLeft}px`;
      piece.elem.style.top = `${piece.elem.offsetTop}px`;

      // Add event listeners for each piece
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
      piece.elem.oncontextmenu = (e) => {
        e.preventDefault();
        // Send this piece backwards.

        this.zIndex += 1; // Increment zIndex counter to bring pieces clicked after this to top

        // Increment zIndex of all pieces to keep their ordering while
        // making sure they are all over 0.
        for (const row of this.currentPuzzle.pieces) {
          for (const pie of row) {
            pie.elem.style.zIndex = Number(pie.elem.style.zIndex) + 1;
          }
        }

        for (const pie of piece.pieceGroup.pieces) {
          pie.elem.style.zIndex = 0;
        }
      }
    }
  }
  
  _showPuzzleBackground = () => {
    const bg = document.getElementById("background");
    const rgb = getAverageRBG(this.currentPuzzle.puzImg);
    bg.style.backgroundColor = `rgba(${rgb[0]},${rgb[1]},${rgb[2]}, 0.5)`;
  }

  _addEventListeners = () => {
    document.addEventListener("mousedown", this._mouseDownListener);
    document.addEventListener("mousemove", this._mousemoveListener);
    document.addEventListener("mouseup", this._mouseupListener);
    document.addEventListener("keydown", this._keyDownListener);
  }

  _removeEventListeners = () => {
    document.removeEventListener("mousedown", this._mouseDownListener);
    document.removeEventListener("mousemove", this._mousemoveListener);
    document.removeEventListener("mouseup", this._mouseupListener);
    document.removeEventListener("keydown", this._keyDownListener);
  }

  _mouseDownListener = (e) => {
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

  _mousemoveListener = (e) => {
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

  _mouseupListener = (e) => {
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

          for (const piece of this.movingPiece.pieceGroup.pieces) {
            piece.elem.style.zIndex = this.zIndex;
          }

          if (this.currentPuzzle.isComplete()) {
            playComplete();
          }
        }
  
        this.movingPiece = null;
      }
    }
  }

  _keyDownListener = (e) => {
    // Use "r" to fetch a new custom puzzle and "o" to open current image in new tab
    if (e.key === "r") {
      this.randCustomPuzzle();
    } else if (e.key === "o") {
      window.open(this.currentPuzzle.puzImg.src);
    } else if (e.key === "l") {
      loadCustomImages();
      loadCustomSounds();
    } else if (e.key === "ArrowRight") {
      this.nextCustomPuzzle();
    } else if (e.key === "ArrowLeft") {
      this.prevCustomPuzzle();
    } else if (e.key === "ArrowUp") {
      this.increasePieces();
    } else if (e.key === "ArrowDown") {
      this.decreasePieces();
    }
  }
}
