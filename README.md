# twitter-striplight
> Twitter monitoring recipe for TJBot with strip light support

This recipe is based on the [twitter-wave](https://github.com/jweisz/twitter-wave) recipe for [TJBot](http://ibm.biz/mytjbot). It adds support for an LED strip light using the [tjbot-striplight](https://github.com/jweisz/tjbot-striplight) module. It also removes support for speaking and waving, since the project for which this was developed does not involve speech or the servo.

## Hardware
This recipe requires a TJBot with an LED strip light. Please see the [tjbot-striplight](https://github.com/jweisz/tjbot-striplight) module for how to integrate an LED strip light into your TJBot.

## Build and Run
Install the dependencies.

    $ cd twitter-striplight
    $ npm install

Create an instance of the [Watson Tone Analyzer](http://www.ibm.com/watson/developercloud/tone-analyzer.html) service and note the authentication credentials.

Create a set of [Twitter developer credentials](https://apps.twitter.com/) and note the consumer key, consumer secret, access token key, and access token secret.

Make a copy the default configuration file and update it with the Watson service credentials.

    $ cp config.default.js config.js
    $ nano config.js
    <enter your credentials in the specified places>

Run!

    sudo node twitter-striplight.js

> Note the `sudo` command. Root user access is required to run TJBot recipes.

At this point, TJBot will begin listening to Twitter for tweets containing the specified keyword (specified in `exports.sentiment_keyword`). It may take some time to collect enough tweets to perform sentiment analysis, so please be patient.

## Customize
You can make a number of customizations in `config.js`.

| Parameter | Description | Default value |
| --- | --- | --- |
| `sentiment_keyword` | The keyword to monitor in Twitter | "education" |
| `sentiment_analysis_frequency_sec` | The number of seconds in between when TJBot performs sentiment analysis | 30 seconds |

With the default configuration, TJBot will monitor Twitter for tweets containing `sentiment_keyword`. Every 30 seconds, he will send all the tweets he has collected to the Watson Tone Analyzer service. Based on the sentiment in the tweets, the LED strip light will change color.

# Watson Services
- [Watson Tone Analyzer](http://www.ibm.com/watson/developercloud/tone-analyzer.html)

# License
This project is licensed under Apache 2.0. Full license text is available in [LICENSE](../../LICENSE).

# Contributing
See [CONTRIBUTING.md](../../CONTRIBUTING.md).
