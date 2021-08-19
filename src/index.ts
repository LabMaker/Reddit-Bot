import { SubmissionStream } from 'snoostorm';
import { RedditConfigAPI } from 'labmaker-api-wrapper';
import { createEvent } from './Event';
import Snoowrap from 'snoowrap';

const configAPI = new RedditConfigAPI();
const id = 'a19050a0-adff-464f-9c10-401e5ff601cb';

(async () => {
  const config = await configAPI.getOne(id);

  const client = new Snoowrap({
    userAgent: config.userAgent,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    username: config.username,
    password: config.password,
  });

  createEvent(client, id);
})();
