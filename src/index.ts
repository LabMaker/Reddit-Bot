import { createEvent } from './Event';
import Snoowrap from 'snoowrap';
import { Labmaker } from './APIHandler';
import * as dotenv from 'dotenv';
dotenv.config();

const id = '3630aeb2-38c5-4c36-a0d5-5c2d95fa35b0';
// const id = 'a19050a0-adff-464f-9c10-401e5ff601cb';

(async () => {
  Labmaker.setAccessToken(process.env.API_TOKEN);

  try {
    const configs = await Labmaker.Reddit.getAll();
    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];
      console.log(`${config._id}: ${config}`);

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
  } catch (err) {
    console.log(err.message);
  }
})();
