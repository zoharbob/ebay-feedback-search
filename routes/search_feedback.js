var express = require('express');
var cheerio = require('cheerio');
var request = require('request');
const bodyParser = require('body-parser');

var app = express.Router();

app.use(bodyParser.json());

app.get('/search_feedback', function(req, res) {

    // console.log(req.query.itemName);
    // console.log(req.query.sellerName);

    var itemName = req.query.itemName;
    var sellerName = req.query.sellerName;
    var pageNum = req.query.pageNum;
    var method_select = parseInt(req.query.method_select); // num of pages

    var feedback_arr = req.app.locals.feedback_arr;

    url = 'http://feedback.ebay.com/ws/eBayISAPI.dll?ViewFeedback2&ftab=AllFeedback&userid='+ sellerName +'&iid=-1&de=off&items=200&interval=0&searchInterval=30&mPg=117&page=' + pageNum;
    var num_of_pages;

            request(url, function (error, response, html) {

                if (!error) {

                    // var feedback_arr = new Array();

                    var $ = cheerio.load(html);

                    var itemParse;

                    // function Feedback(feedback, rating, when) {
                    //     this.feedback = feedback;
                    //     this.rating = rating;
                    //     this.when = when;
                    // }

                    $('.pg-cw span:last-child').filter(function () {

                        var data = $(this);
                        var page_text = data.text();

                        var arr = page_text.split(" ");
                        num_of_pages = arr[arr.length - 1];
                        num_of_pages = parseInt(num_of_pages);

                        if(num_of_pages <= method_select) {
                            method_select = num_of_pages;
                        }
                    });

                    $('.bot').filter(function () {

                        var data = $(this);

                        itemParse = data.children().eq(1).text(); // get item name
                        itemParse = itemParse.substring(0, itemParse.lastIndexOf(" ")); // extract the item number

                        if(itemParse.trim() == itemName){
                            // feedback_arr.push(data.parent().prev().children().first().next().text());
                            if(data.prev().prev().hasClass('fbOuterAddComm')){
                                var feedback = data.prev().prev().children().eq(1).text();
                                var rating =  data.prev().prev().children().children().attr('alt');
                                var when =  data.prev().prev().children().last().text();
                            } else{
                                var feedback = data.prev().children().first().next().text();
                                var rating = data.prev().children().first().children().first().attr('alt');
                                var when = data.prev().children().last().text();
                            }
                            if(rating.includes('Negative')){
                                rating = 'negative';
                            }
                            else if(rating.includes('Positive')){
                                rating = 'positive';
                            }
                            else {
                                rating = 'natural';
                            }
                            feedback_arr.push({feedback, rating, when});
                            // feedback_arr.push(new Feedback(feedback));
                        }

                    })

                    if(pageNum < method_select){
                        req.app.locals.feedback_arr = feedback_arr;

                        return res.redirect('/search_feedback?itemName=' + itemName.trim() + '&sellerName=' + sellerName
                            + '&pageNum=' + (++pageNum) + '&method_select=' + method_select);
                    }

                }

                res.render('search',{
                    url_to_search: req.app.locals.url_to_search,
                    error: false,
                    feedback_arr    // feedback_arr: feedback_arr
                });

            })

});

app.get('/', function(req, res) {
    res.render("instructions")
})

app.get('/url_analyse', function(req, res) {

    var url = req.query.url_input;

    var method_select = req.query.method_select;

    request(url, function (error, response, html) {

        var itemName;
        var sellerName;

        if (!error) {

            var $ = cheerio.load(html);

            $('.it-ttl').filter(function () {

                var data = $(this);

                itemName = data.contents().get(1).nodeValue;

            });

            $('.mbg-nw').filter(function () {

                var data = $(this);

                sellerName = data.text();

            });

            if(sellerName && itemName){
                var feedback_arr = new Array();

                req.app.locals.feedback_arr = feedback_arr;
                req.app.locals.url_to_search = url;

                res.redirect('/search_feedback?itemName=' + itemName.trim() + '&sellerName=' + sellerName + '&pageNum=1' +
                    '&method_select=' + method_select);

                // res.redirect('/check');
            } else {
                res.render("search", {
                    url_to_search: url,
                    error: true
                });
            }

        }else {

            res.render("search", {
                url_to_search: url,
                error: true
            });
        }

    });


});

app.post('/check', function(req, res) {

       console.log(req.body.method_select);

})

module.exports = app;