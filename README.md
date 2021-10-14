# Discord Doubt Bot
Use for doubt somebody

## Requirements
- Node JS v16

## Installation
```shell
git clone https://github.com/eslym/discord-doubt-bot.git
cd discord-doubt-bot
npm install --only=production
```

## Running
Just Run:
```shell
NODE_ENV=prodcution DISCORD_TOKEN="put your bot token here" node index.js
```
Via PM2:
```shell
NODE_ENV=prodcution DISCORD_TOKEN="put your bot token here" pm2 start --name discord-doubt-bot index.js
pm2 save
```
