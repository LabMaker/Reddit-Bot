 # syntax=docker/dockerfile:1
 FROM node:14-alpine
 RUN apk add --no-cache python g++ make
 WORKDIR /app
 COPY . .
 RUN yarn install --production
 CMD ["node", "main.js"]