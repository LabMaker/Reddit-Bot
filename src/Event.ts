import { LogDto, RedditConfigDto } from 'labmaker-api-wrapper';
import { SubmissionStream } from 'snoostorm';
import Snoowrap from 'snoowrap';
import { Labmaker } from './APIHandler';

type LocalLog = {
  username: string;
  createdAt: Date;
};

export async function createEvent(client: Snoowrap, config: RedditConfigDto) {
  const id = config._id;
  let localLogs: LocalLog[] = [];
  let submissionIds = [];
  let counter = 0;
  let postCounter = 0;

  submissionIds = await Labmaker.Log.getSubmissionIds(id);

  const delay = CalculateMinimumDelay(config.subreddits.length, 5) * 3; //Minimum Delay is too little to poll anyways

  config.subreddits.forEach((subreddit) => {
    const stream = new SubmissionStream(client, {
      subreddit,
      limit: 5,
      pollTime: delay,
    });

    console.log(
      `Created Event for ${subreddit} with a delay of ${delay} for user ${config.username}`
    );

    stream.on('item', async (item) => {
      const date = new Date(item.created * 1000);
      const dateNow = new Date();
      const msBetween = dateNow.getTime() - date.getTime();
      const hourDiff = msBetween / (1000 * 3600);
      const { name } = item.author;
      const { display_name } = item.subreddit;
      if (hourDiff > 24) {
        return;
      }

      let didPm = false;
      const validId = submissionIds.find((subId) => subId === item.id);
      console.log(counter, ':', display_name);

      if (validId === undefined || validId === null) {
        submissionIds.push(item.id);
        counter++;
      } else {
        return;
      }

      let valid = true;

      const newConfig = await Labmaker.Reddit.getOne(id);

      if (newConfig.blockedUsers) {
        if (
          newConfig.blockedUsers.find(
            (u) => u.toLowerCase() === name.toLowerCase()
          )
        ) {
          console.log('User Is Blocked');
          valid = false;
        }
      }

      await Promise.all(
        newConfig.forbiddenWords.map((word) => {
          if (item.title.toLowerCase().includes(word.toLowerCase())) {
            valid = false;
          }

          if (item.selftext.toLowerCase().includes(word.toLowerCase())) {
            valid = false;
          }
        })
      );

      if (localLogs.length > 0 && valid) {
        localLogs.forEach((log) => {
          if (log.username === name) {
            const msDifference = date.getTime() - log.createdAt.getTime();
            const minuteDiff = msDifference / (1000 * 60);
            if (minuteDiff < 60) {
              //Dont RePM within 60Mins
              valid = false;
              return;
            }
          }
        });
      }

      if (localLogs.length > 300) {
        localLogs.splice(0, 150); //Removes first 150 Logs as they should be useless
      }

      const newLocalLog: LocalLog = {
        username: name,
        createdAt: new Date(),
      };
      localLogs.push(newLocalLog);

      setTimeout(async function () {
        try {
          if (valid) {
            await client.composeMessage({
              to: item.author,
              subject: newConfig.title,
              text: newConfig.pmBody,
            });

            console.log(
              `${postCounter} : ${name} : ${display_name}  : ${newConfig.pmBody}`
            );

            didPm = true;
            postCounter++;
          }
        } catch (err) {
          console.error(`Error Occured ${err.message}`);
        }

        const log: LogDto = {
          _id: '0',
          nodeId: id,
          username: name,
          message: newConfig.pmBody,
          subreddit: display_name,
          subId: item.id,
          pm: didPm,
        };

        Labmaker.Log.create(log);
      }, newConfig.delay * 1000);
    });
  });
}

//Snoowrap delays Posts every second anyways but this option allows us to not constantly call subreddits
//Calculates the minimum amount of delay to send a GET request every second at Worst Case scenario
function CalculateMinimumDelay(subredditLen: number, maxSubLimit: number) {
  const MAX_RATELIMIT = 600 - subredditLen * maxSubLimit; //Incase we PM every subreddit with the amount of submissions we retreive
  const MAX_RATE_MIN = MAX_RATELIMIT / 10; //600 Requests every 10 minutes
  const delay = 60 / (MAX_RATE_MIN / subredditLen);
  return delay * 1000; //returns in MS
}
