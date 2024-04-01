# Assignment to test Web UI and REST API

This project fetches weather data from the following sources:

1. https://www.accuweather.com
2. https://openweathermap.org

## Goals

1. Fetch the current temperature for a given city from accuweather.com using
   the web UI
2. Fetch the current temperature for the same city using a REST API from
   openweathermap.org
3. Compare the temperature from the two sources and check for the variance
4. Throw a custom exception if the variance exceeds a given threshold

## Installation Instructions

1. Install nodejs. On macOS, use `brew install node`. **Please note this code has been tested with node v21.7.1**
2. Clone this git repo: `git clone https://github.com/katerinanovitskaya/weather-assignment.git`
3. Install required nodejs packages: `npm install`
4. Install Selenium WebDriver: `npm install selenium-webdriver`

## Running the project

1. To run the project, type: `node main.js`
