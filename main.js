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

// Custom exception extends Error object
class VarianceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'VARIANCE_EXCEEDED';
    this.message = message;
  }
}

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
  // Create an instance of the REST client
  var rc = new restClient();

  // Set the address for the geocode API to convert the
  // city, state, country triplet to latitude and longitude
  var geoCodingRequest = "http://api.openweathermap.org/geo/1.0/direct?q=" +
                         searchCity + "," + searchState + "," + searchCountry +
                         "&limit=1&appid=" + owmAPIKey;

  // Call the geocode API. The API is asynchronous, therefore create a
  // Promise object and wait for it to return a response.
  let geoCode = await new Promise((resolve, reject) => {
    rc.get(geoCodingRequest, (data, response) => {
      // Resolve the promise with the data returned by the REST client
      resolve(data);
    });
  });

  // Set the latitude and longitude for the weather API. Use imperial units
  // to return the temperature in Fahrenheit.
  var weatherRequest = "https://api.openweathermap.org/data/2.5/weather?lat=" +
                       geoCode[0].lat + "&" + "lon=" + geoCode[0].lon +
                       "&units=imperial&appid=" + owmAPIKey;

  // Call the weather API. The API is asynchronous, therefore create a
  // Promise object and wait for it to return a response.
  let weather = await new Promise((resolve, reject) => {
    rc.get(weatherRequest, (data, response) => {
      // Resolve the promise with the data returned by the REST client
      resolve(data);
    });
  });

  // Return the temperature
  return weather.main.temp;
}

// Description:
//   This is the main function. It invokes the functions to retrieve
//   the temperature from the UI and API-based sources. It checks for the
//   variance between to the two and throws a custom exception if the
//   variance threshold is exceeded, otherwise it prints a message
//   indicating that the variance is in the accepted range.
async function main() {
  // Get temperature via the UI
  let tempFromUI = await getUITemp();
  // Get temperature via the API
  let tempFromAPI = await getTempFromAPI();

  // Print the results
  console.log("City: " + searchCity + ", " + searchState +
              ", " + searchCountry);
  console.log("Temperature via accuweather.com: " + tempFromUI +
              " deg F");
  console.log("Temperature via openweathermap.org: " + tempFromAPI +
              " deg F");

  // Calculate the variance
  let variance = Math.abs(tempFromUI - tempFromAPI);
  // Check if the variance is within the threshold
  if (variance > varianceThreshold) {
    // Variance exceeds threshold, throw an exception
    throw new VarianceError("Temperature variance exceeded by " +
                                variance + " deg F");
  } else {
    // Variance within limits
    console.log("Variance within limits");
  }
}

// Invoke the main function
main();
