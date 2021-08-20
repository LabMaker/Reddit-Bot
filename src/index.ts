import { RedditConfigAPI } from 'labmaker-api-wrapper';
import { createEvent } from './Event';
import Snoowrap from 'snoowrap';

const configAPI = new RedditConfigAPI();
const id = '3630aeb2-38c5-4c36-a0d5-5c2d95fa35b0';

(async () => {
  const config = await configAPI.getOne(id);
  console.log(config);
  const client = new Snoowrap({
    userAgent: config.userAgent,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    username: config.username,
    password: config.password,
  });

  createEvent(client, id);
})();
