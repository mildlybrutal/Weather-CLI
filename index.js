const readline = require("readline");
const axios = require("axios");
const geoip = require("geoip-lite");
const fs = require("fs");
require("dotenv").config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Press Enter to get your location and weather...", async () => {
  try {
    const response = await axios.get("https://api.ipify.org?format=json");
    const ipAddress = response.data.ip;
    const geo = geoip.lookup(ipAddress);
    if (!geo) {
      console.log("Error: Unable to find location");
      return;
    }
    const lat = geo.ll[0];
    const lon = geo.ll[1];

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.log("Error: API_KEY is not set in .env file");
      return;
    }
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`,
    );
    const weatherData = weatherResponse.data;

    const temperature = weatherData.main.temp;
    const inCelcius = temperature - 273.15;
    const inFahrenheit = (temperature - 273.15) * 1.8 + 32;
    console.log(`Current Temperature: ${inCelcius.toFixed(2)}°C`);
    console.log(`Current Temperature: ${inFahrenheit.toFixed(2)}°F`);

    const clouds = weatherData.clouds?.all;
    if (clouds !== undefined) {
      if (clouds <= 30) {
        console.log("Clear Sky");
        console.log(fs.readFileSync("./ascii/sun.txt", "utf8"));
      } else if (clouds > 30 && clouds <= 70) {
        console.log("Partly Cloudy");
        console.log(fs.readFileSync("./ascii/partlyCloudy.txt", "utf8"));
      } else {
        console.log("Cloudy");
        console.log(fs.readFileSync("./ascii/rain.txt", "utf8"));
      }
    } else {
      console.log("Error: Unable to retrieve cloud data");
    }

    const humidity = weatherData.main?.humidity;
    if (humidity !== undefined) {
      if (humidity < 40) {
        console.log("Low humidity, dry air");
      } else if (humidity < 60) {
        console.log("Moderate humidity, comfortable");
      } else if (humidity < 80) {
        console.log("High humidity, slightly uncomfortable");
      } else if (humidity < 100) {
        console.log("Very high humidity, extremely uncomfortable");
      } else {
        console.log("Invalid humidity value");
      }
    } else {
      console.log("Error: Unable to retrieve humidity data");
    }
  } catch (error) {
    console.log("Error: ", error);
  } finally {
    rl.close();
  }
});
