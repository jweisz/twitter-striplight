/**
 * Copyright 2017 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var TJBot = require('/home/pi/Desktop/tjbot-striplight');
var config = require('./config');
var Twitter = require('twitter');

// obtain our credentials from config.js
var credentials = config.credentials;

// obtain user-specific config
var OWNER_NAME = config.owner_name;
var SENTIMENT_KEYWORD = config.sentiment_keyword;
var SENTIMENT_ANALYSIS_FREQUENCY_MSEC = config.sentiment_analysis_frequency_sec * 1000;

// these are the hardware capabilities that TJ needs for this recipe
var hardware = ['led-strip'];

// turn on debug logging to the console
var tjConfig = {
    log: {
        level: 'info'
    },
    shine: {
        led_strip: {
            num_leds: 60
        }
    }
};

// instantiate our TJBot!
var tj = new TJBot(hardware, tjConfig, credentials);
tj._setupLEDStrip();
console.log("TJBot configured with " + tj.configuration.shine.led_strip.num_leds + " LEDs");

// create the twitter service
var twitter = new Twitter({
    consumer_key: config.credentials.twitter.consumer_key,
    consumer_secret: config.credentials.twitter.consumer_secret,
    access_token_key: config.credentials.twitter.access_token_key,
    access_token_secret: config.credentials.twitter.access_token_secret
});

console.log("I am monitoring twitter for " + SENTIMENT_KEYWORD);

// flash random colors
for (var i = 0; i < 10; i++) {
    tj.shineStripWithRGBColor('random');
    tj.sleep(150);
}
tj.shineStripWithRGBColor('off');

// go do the monitoring
monitorTwitter();


// ---

var TWEETS = [];
var MAX_TWEETS = 100;
var CONFIDENCE_THRESHOLD = 0.5;

function monitorTwitter() {
    // monitor twitter
    twitter.stream('statuses/filter', {
        track: SENTIMENT_KEYWORD
    }, function(stream) {
        stream.on('data', function(event) {
            if (event && event.text) {
                var tweet = event.text;

                // Remove non-ascii characters (e.g chinese, japanese, arabic, etc.) and
                // remove hyperlinks
                tweet = tweet.replace(/[^\x00-\x7F]/g, "");
                tweet = tweet.replace(/(?:https?|ftp):\/\/[\n\S]+/g, "");

                // keep a buffer of MAX_TWEETS tweets for sentiment analysis
                while (TWEETS.length >= MAX_TWEETS) {
                    TWEETS.shift();
                }
                TWEETS.push(tweet);
            }
        });

        stream.on('error', function(error) {
            console.log("\nAn error has occurred while connecting to Twitter. Please check your twitter credentials, and also refer to https://dev.twitter.com/overview/api/response-codes for more information on Twitter error codes.\n");
            throw error;
        });
    });

    // perform sentiment analysis every N seconds
    setInterval(function() {
        console.log("Performing sentiment analysis of the tweets");
        shineFromTweetSentiment();
    }, SENTIMENT_ANALYSIS_FREQUENCY_MSEC);
}

function shineFromTweetSentiment() {
    // make sure we have at least 5 tweets to analyze, otherwise it
    // is probably not enough.
    if (TWEETS.length > 5) {
        var text = TWEETS.join(' ');
        console.log("Analyzing tone of " + TWEETS.length + " tweets");
        tj.analyzeTone(text).then(function(tone) {
            tone.document_tone.tone_categories.forEach(function(category) {
                if (category.category_id == "emotion_tone") {
                    // find the emotion with the highest confidence
                    var max = category.tones.reduce(function(a, b) {
                        return (a.score > b.score) ? a : b;
                    });

                    // make sure we really are confident
                    if (max.score >= CONFIDENCE_THRESHOLD) {
                        // stop pulsing at this point, we are going to change color
                        if (tj.isPulsing()) {
                            tj.stopPulsing();
                        }
                        shineForEmotion(max.tone_id);
                    }
                }
            });
        });
    } else {
        console.log("Not enough tweets collected to perform sentiment analysis");
    }
}

function shineForEmotion(emotion) {
    console.log("Current emotion around " + SENTIMENT_KEYWORD + " is " + emotion);

    switch (emotion) {
        case 'anger':
            tj.shineStripWithRGBColor('red');
        break;

        case 'joy':
            tj.shineStripWithRGBColor('yellow');
        break;

        case 'fear':
            tj.shineStripWithRGBColor('magenta');
        break;

        case 'disgust':
            tj.shineStripWithRGBColor('green');
        break;

        case 'sadness':
            tj.shineStripWithRGBColor('blue');
        break;

        default:
        break;
    }
}
