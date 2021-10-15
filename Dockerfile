FROM node:16-slim

COPY docker-build /home/node/discord-doubt-bot

WORKDIR /home/node/discord-doubt-bot

ENV NODE_ENV=production

CMD /usr/local/bin/node index.js
