var express = require('express');
var fs = require('fs');
var cheerio = require('cheerio');
var app = express();
var expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('view engine', 'ejs');

const routes = require('./routes/search_feedback');

app.use(function (req, res, next) {
    res.locals.url_to_search = "";
    next();
});

// Set Static Folder
app.use(express.static(__dirname + '/public'));

app.use('/', routes);

const port = process.env.PORT || 8081;

app.listen(port, () => {
    console.log('Magic happens on port 8081');
});


exports = module.exports = app;
