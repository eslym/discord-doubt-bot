"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const commands = [
    {
        name: 'Ask for Doubt',
        type: 'MESSAGE',
    }
];
const buttons = [
    new discord_js_1.MessageActionRow()
        .addComponents(new discord_js_1.MessageButton()
        .setStyle('SECONDARY')
        .setEmoji('❌')
        .setCustomId('doubt'))
];
const intents = new discord_js_1.Intents()
    .add(discord_js_1.Intents.FLAGS.GUILDS)
    .add(discord_js_1.Intents.FLAGS.GUILD_MESSAGES);
const client = new discord_js_1.Client({ intents });
function handleButton(button) {
    return __awaiter(this, void 0, void 0, function* () {
        let channel = button.channel;
        if (!channel) {
            let guild = yield client.guilds.fetch(button.guildId);
            channel = (yield guild.channels.fetch(button.channelId));
        }
        let message = button.message instanceof discord_js_1.Message ?
            button.message : yield channel.messages.fetch(button.message.id);
        let source = yield message.fetchReference();
        try {
            yield source.reply(`${button.user.toString()} doubted.`);
            yield button.reply({ content: 'You doubted.', ephemeral: true });
        }
        catch (_) {
            yield button.reply({ content: "Sorry, I can't help you to ask for doubt at here.", ephemeral: true });
        }
    });
}
function handleContextMenu(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let channel = context.channel;
        if (!channel) {
            let guild = yield client.guilds.fetch(context.guildId);
            channel = (yield guild.channels.fetch(context.channelId));
        }
        let message = yield channel.messages.fetch(context.targetId);
        try {
            yield message.reply({
                content: 'Press ❌ to doubt.',
                components: buttons
            });
            yield context.reply({ content: 'You asked for doubt.', ephemeral: true });
        }
        catch (_) {
            yield context.reply({ content: "Sorry, I can't help you to ask for doubt at here.", ephemeral: true });
        }
    });
}
client.on('ready', () => (() => __awaiter(void 0, void 0, void 0, function* () {
    let link = new URL('https://discord.com/oauth2/authorize');
    link.searchParams.set('client_id', client.application.id);
    link.searchParams.set('scope', 'bot applications.commands');
    link.searchParams.set('permissions', '274877975552');
    console.log('Use this link to invite bot:');
    console.log(link.toString());
    let guilds = yield client.guilds.fetch({});
    for (let guildData of guilds.values()) {
        let guild = yield guildData.fetch();
        if (!guild.commands) {
            continue;
        }
        yield guild.commands.set(commands)
            .catch(console.warn);
    }
}))().catch(console.error));
client.on('guildCreate', (guild) => (() => __awaiter(void 0, void 0, void 0, function* () {
    yield guild.commands.set(commands)
        .catch(console.warn);
}))().catch(console.error));
client.on('interactionCreate', (interaction) => (() => __awaiter(void 0, void 0, void 0, function* () {
    if (interaction.isButton()) {
        return handleButton(interaction);
    }
    if (interaction.isContextMenu()) {
        return handleContextMenu(interaction);
    }
}))().catch(console.error));
client.login(process.env.DISCORD_TOKEN)
    .catch(console.error);

//# sourceMappingURL=index.js.map
