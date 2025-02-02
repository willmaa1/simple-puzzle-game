import { getRandomCustomImage, loadCustomImages } from "./js/imgloader.js";
import { createNewPuzzle, currentPuzzle } from "./js/puzzlepiece.js";

createNewPuzzle(3,3);
loadCustomImages();

// Use "r" to fetch a new custom puzzle and "o" to open current image in new tab
document.addEventListener("keydown", (e) => {
  if (e.key === "r") {
    const size = [1.5,2,3][Math.floor(Math.random()*3)];
    const columns = Math.floor((3 + Math.floor(Math.random()))*size);
    const rows = Math.floor((3 + Math.floor(Math.random()))*size);

    createNewPuzzle(columns, rows, getRandomCustomImage());
  } else if (e.key === "o") {
    window.open(currentPuzzle.puzImg.src);
  }
})
