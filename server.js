const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8000;

app.use("/", express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/index.html"));
});

// Serving custom puzzles
app.use("/custompuzzles", express.static(path.join(__dirname, "/custompuzzles")));
app.get("/custompuzzles", (req, res) => {
  const ress = fs.readdirSync(path.join(__dirname, "custompuzzles"));
  res.send(ress);
});

// Serving custom sounds
app.use("/snap", express.static(path.join(__dirname, "/customsounds/snap")));
app.get("/snap", (req, res) => {
  const ress = fs.readdirSync(path.join(__dirname, "customsounds/snap"));
  res.send(ress);
});
app.use("/complete", express.static(path.join(__dirname, "/customsounds/complete")));
app.get("/complete", (req, res) => {
  const ress = fs.readdirSync(path.join(__dirname, "customsounds/complete"));
  res.send(ress);
});


app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}/`);
});
