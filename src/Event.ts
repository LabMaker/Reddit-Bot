import { RedditConfigAPI } from 'labmaker-api-wrapper';
import { SubmissionStream } from 'snoostorm';
import Snoowrap from 'snoowrap';

const configAPI = new RedditConfigAPI();

export async function createEvent(client: Snoowrap, id: string) {
  let dynamicPollTime = 5000;
  let submissionIds = [];
  let counter = 0;
  let postCounter = 0;
  const config = await configAPI.getOne(id);

  config.subreddits.forEach((subreddit) => {
    const stream = new SubmissionStream(client, {
      subreddit: subreddit,
      limit: 5,
      pollTime: dynamicPollTime,
    });

    dynamicPollTime += 5000;
    console.log('Created Event for', subreddit);

    stream.on('item', async (item) => {
      const newConfig = await configAPI.getOne(id);
      const currentDate = new Date();
      let didPm = false;
      const validId = submissionIds.find((subId) => subId === item.id);
      console.log(counter, ':', item.subreddit.display_name);

      if (validId === undefined) {
        submissionIds.push(item.id);
        counter++;
      } else {
        return;
      }

      let valid = true;

      newConfig.forbiddenWords.forEach((word) => {
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
              newConfig.pmBody
            }`
          );

          client.composeMessage({
            to: item.author,
            subject: newConfig.title,
            text: newConfig.pmBody,
          });

          didPm = true;

          postCounter++;
        }

        //Add Logging Later
        // axios.post(domain + 'createLog', {
        //   username: item.author.name,
        //   message: config.pmBody,
        //   subreddit: item.subreddit.display_name,
        //   time: currentDate.toLocaleString({ timeZone: 'BST' }),
        //   subId: item.id,
        //   pm: didPm,
        // });
      }, 60000);
    });
  });
}
