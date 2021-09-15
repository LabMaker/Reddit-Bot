import LabmakerAPI from 'labmaker-api-wrapper';

export const Labmaker = new LabmakerAPI(process.env.API_URL, {
  debug: process.env.API_DEBUG === 'true',
});
