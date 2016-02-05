var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express ',
      jss : '/' + _global.getJS('client', 'config.js') 
  });
  console.log(_global.getJS('client', 'config.js') )
});

module.exports = router;
