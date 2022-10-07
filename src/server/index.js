require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", express.static(path.join(__dirname, "../public")));

//API calls
const apiBaseUrl = "https://api.nasa.gov/mars-photos/api/v1";

// Calling picture of the day
app.get("/apod", async (req, res) => {
  try {
    let image = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`
    ).then((res) => res.json());
    res.send({ image });
  } catch (err) {
    console.log("error:", err);
  }
});

// Getting rover data
app.get("/rover/:rover_name", async (req, res) => {
  try {
    let roverData = await fetch(
      `${apiBaseUrl}/manifests/${req.params.rover_name}?api_key=${process.env.API_KEY}`
    ).then((res) => res.json());
    res.send({ roverData });
  } catch (err) {
    console.log("error:", err);
  }
});

// Getting rover prictures
// latest_photos api is not documented in nasa original api website https://api.nasa.gov/
// You can find the documentation in authors github account @ https://github.com/chrisccerami/mars-photo-api
app.get("/rover/pics/:rover_name", async (req, res) => {
  try {
    let pics = await fetch(
      `${apiBaseUrl}/rovers/${req.params.rover_name}/latest_photos?&api_key=${process.env.API_KEY}`
    ).then((res) => res.json());
    res.send({ pics });
  } catch (err) {
    console.log("error:", err);
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
