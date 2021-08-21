import { createEvent } from './Event';
import Snoowrap from 'snoowrap';
import LabmakerAPI from './APIHandler';

const id = '3630aeb2-38c5-4c36-a0d5-5c2d95fa35b0';

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

    createEvent(client, id);
  } catch (err) {
    console.log(err);
  }
})();
