const { SubmissionStream } = require("snoostorm");

const Snoowrap = require("snoowrap");
const fetch = require("node-fetch");
const axios = require("axios");
let submissionIds = [];
let config = "";
let counter = 0;
let postCounter = 0;
let domain = "https://reddit-api-bot.herokuapp.com/";
const devMode = false;

if (devMode) {
  domain = "http://localhost:3000/";
}

let r;

async function getJson(uri) {
  let response = await fetch(domain + uri);
  let data = await response.json();
  return data;
}

function createEvent() {
  let dynamicPollTime = 5000;
  config.subreddits.forEach((subreddit) => {
    const stream = new SubmissionStream(r, {
      subreddit: subreddit,
      limit: 5,
      pollTime: dynamicPollTime,
    });

    dynamicPollTime += 5000;
    console.log("Created Event for", subreddit);

    stream.on("item", (item) => {
      const validId = submissionIds.find((subId) => subId === item.id);
      console.log(counter, ":", item.subreddit.display_name);
      if (validId === undefined) {
        submissionIds.push(item.id);
        axios
          .post(domain + "ids", {
            id: item.id,
          })
          .catch();
        counter++;
      } else {
        return;
      }

      let valid = true;

      config.forbiddenWords.forEach((word) => {
        if (item.title.toLowerCase().includes(word.toLowerCase())) {
          valid = false;
        }

        if (item.selftext.toLowerCase().includes(word.toLowerCase())) {
          valid = false;
        }
      });

      if (valid) {
        console.log(
          postCounter,
          ":",
          item.author.name,
          ":",
          item.subreddit.display_name
        );

        r.composeMessage({
          to: item.author,
          subject: config.title,
          text: config.pmBody,
        });

        postCounter++;
      }
    });
  });
}

getJson("submissions").then((data) => {
  submissionIds = data.ids;
  getJson("config").then((dt) => {
    config = dt;
    console.log(config);

    r = new Snoowrap({
      userAgent: config.userAgent,
      clientId: config.clientID,
      clientSecret: config.clientSecret,
      username: config.username,
      password: config.password,
    });

    createEvent();
  });
});
//function createStream(item, index) {}
