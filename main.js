// Import Selenium Webdriver
const { Builder, Browser, By, Key, until } = require('selenium-webdriver')

// Change the following to search for another city
const cityName = 'Austin,TX';

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

// Main function
async function main() {
  let tempFromUI = await getUITemp();

  console.log("City: " + cityName);
  console.log("Temperature via accuweather.com: " + tempFromUI +
              " deg F");
}

main();
