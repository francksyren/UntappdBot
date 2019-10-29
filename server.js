const httpProxy = require('http-proxy');
// const modifyJsonResponse = require('node-http-proxy-json');
const express = require('express');

const request = require('request');
const url = require('url');
const rp = require('request-promise');

const brewery = require('./brewery');

const apiHost = 'https://api.untappd.com/v4';

var app = express();

console.log(`********* Proxy to ${apiHost} **********`)

var proxy = httpProxy.createProxyServer({});

const client_id = "6C4148A3B9B6E88D55CB71AADBC15A9F835EE98E";
const client_secret = "58925A493B8A21438F1A51ED10B833A0D66CEDF2";


const beerTypes = {
  "Belgian": [63, 132, 242],
  "Pale Ale": [99, 294],
  "Blonde Ale": [13],
  "Golden Ale": [97],
  "Red Ale": [60, 111, 29],
  "Kolsch": [30],
  "Lager": [247, 261, 262, 38, 50, 67],
  "Pilsner": [207, 104],
  "IPA": [128, 227, 284, 305, 280, 248, 252],
  "Sour": [301, 70, 81],
  "Stout": [41, 47, 163, 250, 272, 231],
  "Wheat": [5, 83],
  "Porter": [131, 165]
};
/* NOT USED
proxy.on('proxyReq', function(proxyReq, req, res, options) {
    parsed = url.parse(proxyReq.path, true);
    parsed.query['client_id'] = client_id;
    parsed.query['client_secret'] = client_secret;
    updated_path = url.format({pathname: parsed.pathname, query: parsed.query});
    proxyReq.path = updated_path;
    console.log(updated_path);
});
*/

function addAuthorizationKeysToUrl(path) {
    var parsed = url.parse(path, true);
    parsed.query['client_id'] = client_id;
    parsed.query['client_secret'] = client_secret;
    return url.format({pathname: parsed.pathname, query: parsed.query});
}


function searchBrewery(req, res) {

    var reqUrl = req.originalUrl;
    var finalUrl = apiHost + addAuthorizationKeysToUrl(reqUrl);

    var options = {
        url: finalUrl
    }
    request(options, (error, resp, body) => {
        console.log(error);

        const data = JSON.parse(resp.body);

        const card = brewery.formatCard(data);
        sendResponse(res, card);
    });
}

// Search beer
function searchBeer(req, res) {

    var reqUrl = req.originalUrl;
    var finalUrl = apiHost + addAuthorizationKeysToUrl(reqUrl);

    var options = {
        url: finalUrl
    }
    request(options, (error, resp, body) => {
        console.log(error);

        const data = JSON.parse(resp.body);
        const list = brewery.formatBeerList(data["response"]["beers"]);

        sendResponse(res, list);
    });
}


// getBreweryInfo
function getBreweryInfo(req, res) {
  console.log("brewery detail");
  var reqUrl = req.originalUrl;
  var finalUrl = apiHost + addAuthorizationKeysToUrl(reqUrl);
  console.log(finalUrl);
  var options = {
      url: finalUrl
  }
  request(options, (error, resp, body) => {
      console.log(error);

      const data = JSON.parse(resp.body);

      const list = brewery.formatBeerList(data["response"]["brewery"]["beer_list"]);

      sendResponse(res, list);
  });

}


// getBreweryInfoWithBeerType
function getBreweryInfoWithBeerType(req, res) {

console.log(req);
  const breweryid = req.params.breweryid
  const beerType = req.params.beertype

  console.log(beerType);
  if (!beerType || !breweryid) {
      res.writeHead(400);
      console.log('Missing information in URL /brewery/info/:breweryid/:beertype');
      return;
  }

  var reqUrl = req.originalUrl;
  var finalUrl = apiHost + addAuthorizationKeysToUrl(reqUrl);

  var urls = [finalUrl, finalUrl];

  Promise.all(urls.map(rp)).then(allData => {
      // All data available here in the order of the elements in the array
      console.log("****************");
      sendResponse(res, fallbackMessage("*********"))
      // console.log(allData);
  }).catch(function(error) {
      console.error("ERROR");
      sendResponse(res, fallbackMessage("Internal Server Error"))
    });
}


// Handle responses

function sendResponse(res, responseBody) {
    // console.log(responseBody);
    res.send( responseBody );
}

function fallbackMessage(msg) {
    return [{
        type: 'text',
        content: msg,
    }];
}

app.use(express.static("public"));
app.post('^/search/brewery', searchBrewery);
app.post('^/search/beer', searchBeer);
app.post('^/brewery/info/:breweryid', getBreweryInfo);
app.post('^/brewery/info/:breweryid/:beertype', getBreweryInfoWithBeerType);

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, X-Request-Token, Content-Type, Accept, Authorization");
//     next();
// });

// app.get('/*', handleCAISync);
// app.post('/*', handleCAISync);


const port = 8080;
app.listen(port, function () {
    console.log("Server listening on port " + port);
});
