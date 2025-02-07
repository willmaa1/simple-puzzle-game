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


https://github.com/user-attachments/assets/650a9852-6cf8-4c1a-9526-26b7afbcedd6

### Custom images

Place your images to the `custompuzzles` folder to be able to play them.

### Controls

| Key | Function |
|--|--|
| Right click | Drag to connect pieces |
| Left click | Send a piece to the back |
| o | Open the image in new tab |
| l | Refresh available custom images |
| r | Load a random custom image |
| RightArrow | Next custom image |
| LeftArrow | Prev custom image |
| UpArrow | More pieces |
| DownArrow | Less pieces |

## Limitations
Snapping is only checked for the piece you are moving, not any of the connected pieces.

Pieces appear visually nice but are actually rectangles, meaning they can be dragged from their transparent parts.


## Acknowledgements

Default image *Balloons.jpg* by [DarlArthurS](https://commons.wikimedia.org/wiki/File:Colorado_Springs_Hot_Air_Balloon_Competition.jpg), [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0), via Wikimedia Commons
