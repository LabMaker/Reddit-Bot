const { SubmissionStream } = require("snoostorm");

const Snoowrap = require("snoowrap");
const fetch = require("node-fetch");
const axios = require("axios");
let submissionIds = [];
let config = "";
let counter = 0;
let postCounter = 0;
let domain = "https://reddit-api-bot2.herokuapp.com/bot/";
const devMode = true;

if (devMode) {
  domain = "http://localhost:3000/bot/";
}

let r; //Snoowrap Reddit Client

async function getJson(uri) {
  let response = await fetch(domain + uri);
  let data = await response.json();
  return data;
}

function createEvent() {
  let dynamicPollTime = 5000;
  subreddits = config.subreddits.split(",");
  subreddits.forEach((subreddit) => {
    const stream = new SubmissionStream(r, {
      subreddit: subreddit,
      limit: 5,
      pollTime: dynamicPollTime,
    });

    dynamicPollTime += 5000;
    console.log("Created Event for", subreddit);

    stream.on("item", (item) => {
      getJson("config").then((dt) => {
        config = dt[0];
        const currentDate = new Date();
        didPm = false;
        const validId = submissionIds.find((subId) => subId === item.id);
        console.log(counter, ":", item.subreddit.display_name);
        if (validId === undefined) {
          submissionIds.push(item.id);
          counter++;
        } else {
          return;
        }

        let valid = true;

        forbiddenWords = config.forbiddenWords.split(",");
        forbiddenWords.forEach((word) => {
          if (item.title.toLowerCase().includes(word.toLowerCase())) {
            valid = false;
          }

          if (item.selftext.toLowerCase().includes(word.toLowerCase())) {
            valid = false;
          }
        });
        setTimeout(function () {
          if (valid) {
            const { author } = item;
            const redditName = item.subreddit.display_name;

            console.log(
              `${postCounter} : ${
                author.name
              } : ${redditName} : ${currentDate.toLocaleString()} : ${
                config.pmBody
              }`
            );
            r.composeMessage({
              to: item.author,
              subject: config.title,
              text: config.pmBody,
            });

            didPm = true;

            postCounter++;
          }

          axios.post(domain + "createLog", {
            username: item.author.name,
            message: config.pmBody,
            subreddit: item.subreddit.display_name,
            time: currentDate.toLocaleString({ timeZone: "BST" }),
            subId: item.id,
            pm: didPm,
          });
        }, 60000);
      });
    });
  });
}

getJson("submissions").then((data) => {
  submissionIds = data;
  console.log(submissionIds);
  getJson("config").then((dt) => {
    config = dt[0];
    console.log(config);

    r = new Snoowrap({
      userAgent: config.userAgent,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      username: config.username,
      password: config.password,
    });

    createEvent();
  });
});
//function createStream(item, index) {}
