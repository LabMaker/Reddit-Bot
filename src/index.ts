import { createEvent } from './Event';
import Snoowrap from 'snoowrap';
import LabmakerAPI from './APIHandler';

const id = '3630aeb2-38c5-4c36-a0d5-5c2d95fa35b0';
// const id = 'a19050a0-adff-464f-9c10-401e5ff601cb';

(async () => {
  try {
    const config = await LabmakerAPI.Reddit.getOne(id);
    console.log(config);
    const client = new Snoowrap({
      userAgent: config.userAgent,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      username: config.username,
      password: config.password,
    });

    client.config({
      continueAfterRatelimitError: true,
      requestDelay: 1000,
      debug: true,
    });

    createEvent(client, id);
  } catch (err) {
    console.log(err);
  }
})();
