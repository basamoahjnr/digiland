'use strict';


const uri = 'http://api.agromonitoring.com/agro/1.0/image/search?';


/**
 * Loops through a JSON Objects and returns it value
 * @param object
 * @param  propertyToFind
 * @returns {*}
 */
function getValue(object, propertyToFind) {
  if (typeof propertyToFind === 'string') {
    propertyToFind = propertyToFind.split('.')
  }
  return propertyToFind.length ? getValue(object[propertyToFind.shift()], propertyToFind) : object;
}

function displayImage(uri) {

  let myImage = new Image();

  get(uri, 'blob').then(function (response) {
    // create an image
    myImage.src = window.URL.createObjectURL(response);

// append it to your page
    document.body.appendChild(myImage);
  });
}

/**
 * note that the month starts from 0 therefore January is 0 and December is 11
 *
 * @param {Date} date date object
 * @returns {number} number of seconds from 1st July 1970
 */
function utcToUnix(date) {

  let datum = new Date(date);
  // let day = datum.getDate();
  // let month = datum.getMonth() + 1;
  // let year = datum.getFullYear();

  return datum.valueOf() / 1000;
}


/**
 *
 * @param {Number} unixDate unix number in seconds
 * @returns {string} string representation of date in UTC format
 */
function unixToUtc(unixDate) {
  let datum = new Date(unixDate * 1000);
  return datum.toDateString();
}


function get(url, responseType) {
  // Create new promise with the Promise() constructor;
  // This has as its argument a function
  // with two parameters, resolve and reject
  return new Promise(function (resolve, reject) {
    // Standard XHR to load an image
    let request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = responseType;
    // When the request loads, check whether it was successful
    request.onload = function () {
      if (request.status === 200) {
        // If successful, resolve the promise by passing back the request response
        resolve(request.response);
      } else {
        // If it fails, reject the promise with a error message
        reject(Error('Api query didn\'t load successfully; error code:' + request.statusText));
      }
    };
    request.onerror = function () {
      // Also deal with the case when the entire request fails to begin with
      // This is probably a network error, so reject the promise with an appropriate message
      reject(Error('There was a network error.'));
    };
    // Send the request
    request.send();
  });
}


function fetch(uri, moreOpt = {}, responseType) {
  if (responseType == null) throw  Error("responseType cannot be nul");
  const delimiter = '&';

  //using block brackets initializes the JSON OBject as an array
  const opt = {
    "appid": "52d58040490bb225018696deb7b881de"
  };

  const data = Object.assign(opt, moreOpt);

  Object.keys(data).forEach((key) => {
    uri += key + '=' + data[key] + delimiter;
  });

  //cheap way to get rid of '&' ha-ha-ha-ha
  return get(uri.substring(0, uri.length - 1), responseType);
}


function query_api(form) {
  const moreOpt = {
    'start': utcToUnix(form.startDate.value),
    'end': utcToUnix(form.endDate.value),
    'polyid': form.polygonId.value
  };

  fetch(uri, moreOpt, 'json').then(function (response) {
      //for each key in the Array
      Object.keys(response).forEach(key => {
        //get the json value belonging to that array
        let responseElement = response[key];

        document.getElementById("dt").innerHTML = unixToUtc(getValue(responseElement, 'dt'));
        document.getElementById("truecolor").innderHTML = displayImage(getValue(responseElement, 'image.truecolor'));
        document.getElementById("falsecolor").innderHTML = displayImage(getValue(responseElement, 'image.falsecolor'));
        document.getElementById("ndvi").innderHTML = displayImage(getValue(responseElement, 'image.ndvi'));
        document.getElementById("evi").innderHTML = displayImage(getValue(responseElement, 'image.evi'));


      })

    }
    , function (Error) {
      console.log(Error);
    })
}


