# Simple puzzle game

Simple puzzle game with pure JavaScript. Uses canvas to draw and crop images for each piece.

Node.js with express used for serving files.

## Installation

`npm install`

## Running

`npm start`

## Playing

Open `localhost:8000` with some browser and enjoy!

The pieces will snap to connect when released near each other. Connected pieces move together and a sound cue is played when snapping.

Add custom images to the `custompuzzles` folder. Press **l** to refresh the available custom images. Press **r** to load a random image from the custompuzzle folder. The number of pieces is also randomized.

Press **o** while playing to open the image in a new tab.

Left click to send a piece or group of pieces to the back.

https://github.com/user-attachments/assets/650a9852-6cf8-4c1a-9526-26b7afbcedd6

## Limitations
Snapping is only checked for the piece you are moving, not any of the connected pieces.

Pieces appear visually nice but are actually rectangles, meaning they can be dragged from their transparent parts.


## Acknowledgements

Default image *Balloons.jpg* by [DarlArthurS](https://commons.wikimedia.org/wiki/File:Colorado_Springs_Hot_Air_Balloon_Competition.jpg), [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0), via Wikimedia Commons
