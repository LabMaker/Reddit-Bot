 # syntax=docker/dockerfile:1
 FROM node:14-alpine
 RUN apk add --no-cache python g++ make
 WORKDIR /app
 COPY . .
 RUN node install --production
 CMD ["node", "main.js"]