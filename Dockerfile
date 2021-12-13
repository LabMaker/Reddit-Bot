# Build stage
FROM node:16 AS builder

# Create build dir
WORKDIR /build

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./

COPY src/ .
RUN [ "npm", "run", "build" ]

# Run stage
FROM node:16

# Create app dir
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# Build in production mode
RUN npm ci --only=production

# Copy over built files
COPY --from=0 /build/lib/ ./

CMD [ "node", "index.js" ]
