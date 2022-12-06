FROM docker.io/node:16
ENV NODE_ENV=production
WORKDIR /usr/src

COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production && \
    mkdir /usr/src/config

COPY . .
RUN mv config.js.docker config.js
CMD [ "node",  "index.js" ]
