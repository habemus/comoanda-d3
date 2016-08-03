
const fs   = require('fs');

// third-party
const superagent = require('superagent');

var typeformAPIKey = '1863a4d5bcae1d13d3d7ec231e18e5e12c5e30f0';
var typeformFormId = 'RoOGoD';
var typeformQueryString = '&completed=true&order_by[]=date_submit,desc';
var url = 'https://api.typeform.com/v1/form/' + typeformFormId + '?key=' + typeformAPIKey + typeformQueryString;

superagent.get(url)
  .end(function (err, res) {
    fs.writeFileSync(__dirname + '/typeform-data.json', JSON.stringify(res.body, null, '\t'));
  });
