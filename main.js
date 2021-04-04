const { SubmissionStream } = require("snoostorm");

const Snoowrap = require("snoowrap");
const fs = require("fs");
const submissionFile = require("submissionids.json");
const config = require("config.json");
let submissionIds = submissionFile.ids;
let counter = 0;
let postCounter = 0;
let postSubIds = [];

const r = new Snoowrap({
  userAgent: "<platform:Firefox:0.0.1> (by /HomeworkHelperr/)",
  clientId: "3Q99PaRizNBwUg",
  clientSecret: "7pEEMYSKTK1Nc2gmIjTLfLbPco9uMA",
  username: "HomeworkHelperr",
  password: "Bomb1234",
});

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

      submissionFile.ids = submissionIds;

      fs.writeFileSync(
        "submissionids.json",
        JSON.stringify(submissionFile, null, 1)
      );

      if (valid) {
        if (postCounter.toString().length != counter.toString().length) {
          let diff = counter.toString().length - postCounter.toString().length;
          let newPostCounter = postCounter.toString();
          for (let i = 0; i < diff; i++) {
            newPostCounter = "0" + newPostCounter;
          }

          postCounter = parseInt(newPostCounter);
        }

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

createEvent();

//function createStream(item, index) {}
