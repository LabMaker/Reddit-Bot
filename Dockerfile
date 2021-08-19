 # syntax=docker/dockerfile:1
 FROM node:14
 RUN apk add --no-cache python g++ make
 WORKDIR /usr/src/app
 COPY . .
 RUN node install --production
 CMD ["node", "./lib/index.js"]