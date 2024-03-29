// Import Selenium Webdriver
const { Builder, Browser, By, Key, until } = require('selenium-webdriver')
// Import REST client
const restClient = require("node-rest-client").Client;

// Change the following lines of code to update the location
const searchCity = "Austin";
const searchState = "TX";
const searchCountry = "USA";

// API Key for openweathermap.org
const owmAPIKey = "9fe9f79f2096b5eca0b384bda7cb7bb0";

// Threshold for temperature variance
const varianceThreshold = 1.0;

// Description:
//   This function gets the current temperature from accuweather.com
//   The code uses Selenium to launch a web browser and enter the city name
//   in the search bar. It then selects the first match from the search
//   results and retrieves the current temperature.
// Parameters:
//   None
// Return Value:
//   Integer value of the current temperature for the given city in Fahrenheit
//
async function getUITemp() {
  var currentTemp;

  // Launch the Firefox web browser
  let driver = await new Builder().forBrowser(Browser.CHROME).build();

  // Set search string to city,state
  let cityName = searchCity + "," + searchState;

  try {
    // Retrieve the home page
    await driver.get('https://www.accuweather.com');
    // Get UI element for the search bar
    let searchBar = await driver.findElement(By.name('query'));
    // Send the city name followed by the <ENTER> key
    await searchBar.sendKeys(cityName);
    await searchBar.sendKeys(Key.ENTER);
    // Wait for the search results to load
    await driver.wait(until.titleContains('Find Your Location'), 10000);
    // Set timeout to 10 seconds
    await driver.manage().setTimeouts({ implicit: 10000});
    // Get the first item from the search results
    let location = await driver.findElement(By.className('location-name'));
    // Simulate a mouse click on the first item
    await driver.executeScript("arguments[0].click();", location);
    // Wait for the page to load
    await driver.wait(until.titleContains('Weather Forecast'), 10000);
    // Set timeout to 10 seconds
    await driver.manage().setTimeouts({ implicit: 10000});
    // Get the temperature UI element
    let temp = await driver.findElement(By.className('temp'));
    // Get the value
    currentTemp = await temp.getText();
    // Convert to an integer
  } finally {
    await driver.quit()
  }
  return parseInt(currentTemp, 10);
}

// Description:
//   This function gets the current temperature from openweathermap.org
//   via a REST API. The API to retrieve the temperature requires precise
//   latitude and longitude coordinates. The code first calls a geocode
//   API to convert the city to latitude and longitude and then calls
//   the API to retrieve the current weather data.
// Parameters:
//   None
// Return Value:
//   Integer value of the current temperature for the given city in Fahrenheit
//
async function getTempFromAPI() {
  var rc = new restClient();
  var geoCodingRequest = "http://api.openweathermap.org/geo/1.0/direct?q=" +
                         searchCity + "," + searchState + "," + searchCountry +
                         "&limit=1&appid=" + owmAPIKey;

  let geoCode = await new Promise((resolve, reject) => {
    rc.get(geoCodingRequest, (data, response) => {
      resolve(data);
    });
  });

  var weatherRequest = "https://api.openweathermap.org/data/2.5/weather?lat=" +
                       geoCode[0].lat + "&" + "lon=" + geoCode[0].lon +
                       "&units=imperial&appid=" + owmAPIKey;

  let weather = await new Promise((resolve, reject) => {
    rc.get(weatherRequest, (data, response) => {
      resolve(data);
    });
  });

  return weather.main.temp;
}

// Main function
async function main() {
  let tempFromUI = await getUITemp();
  let tempFromAPI = await getTempFromAPI();

  console.log("City: " + searchCity + ", " + searchState +
              ", " + searchCountry);
  console.log("Temperature via accuweather.com: " + tempFromUI +
              " deg F");
  console.log("Temperature via openweathermap.org: " + tempFromAPI +
              " deg F");
}

main();
