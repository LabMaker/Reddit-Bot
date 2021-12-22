import { createEvent } from './Event';
import Snoowrap from 'snoowrap';
import { Labmaker } from './APIHandler';
import * as dotenv from 'dotenv';
dotenv.config();

(async () => {
  Labmaker.setAccessToken(process.env.API_TOKEN);

  try {
    const configs = await Labmaker.Reddit.getAll();
    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];
      console.log(`${config.id}: ${config.username}`);

      if (config.subreddits.length > 0) {
        const client = new Snoowrap({
          userAgent: config.userAgent,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          username: config.username,
          password: config.password,
        });

        client.config({
          continueAfterRatelimitError: true,
          requestDelay: 1001,
          debug: false,
          maxRetryAttempts: 3,
        });

        createEvent(client, config);
        await new Promise((resolve) => setTimeout(resolve, 60 * 1000));
      }
    }
  } catch (err) {
    console.log(err.message);
  }
})();
