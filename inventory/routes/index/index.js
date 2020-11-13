var express = require('express');
var router = express.Router();
const axios = require('axios');

/* GET home page. */
router.get('/', function(req, res) {
  req.vueOptions = {
    head : {
      title : "Adidas",
      scripts: [
        {src: 'https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.0/axios.min.js'},
        {src: 'https://code.jquery.com/jquery-3.5.1.min.js'},
        {src: '/javascripts/toastr/toastr.min.js'},
      ],
      styles: [
        { style: '/stylesheets/bootstrap/bootstrap.css' },
        { style: '/stylesheets/font-awesome/all.min.css' },
        { style: '/stylesheets/style.css' },
        { style: '/stylesheets/toastr/toastr.css' }
      ]
    }
  };

  var data = {
    header: 'Adidas Product Inventory',
    products: [],
    error: false,
  };

  var acceptLanguage = 'en-us';
  if (req.headers["accept-language"]) {
    if (req.headers["accept-language"].toLowerCase().startsWith('en-gb')) {
      acceptLanguage = 'en-gb';
    } else if (req.headers["accept-language"].toLowerCase().startsWith('de')) {
      acceptLanguage = 'de-de';
    } else if (req.headers["accept-language"].toLowerCase().startsWith('es')) {
      acceptLanguage = 'es-es';
    }
  }

  var promises = [];

  axios.get('http://inventory-engine:3001/api/products').then(function(response) {

    for (var i = 0; i < response.data.length; i++) {
      let element = response.data[i];
      promises.push(
          axios.get('http://pricing-engine:3000/product/'+element.id, {
            headers: {
              "accept-language": acceptLanguage
            }
          }).then(function(priceEngineResponse) {
            element.price = priceEngineResponse.data.currency+ ' ' +priceEngineResponse.data.price;
            data.products.push(element);
          }).catch(function (error) {
            data.error = true;
          })
      );
    }

    Promise.all(promises).then(() => res.renderVue('../views/index/index.vue', data, req.vueOptions));
  });

})

module.exports = router;
