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
const path = require("path");
const fs = require("fs");
const YAML = require("yaml");
const util_1 = require("util");
const root = path.resolve(__dirname, '..');
const commands = [
    {
        name: 'Ask for Doubt',
        type: 'MESSAGE',
    }
];
const reactions = {};
if (fs.existsSync(path.resolve(root, 'reactions.yml'))) {
    let res = YAML.parse(fs.readFileSync(path.resolve(root, 'reactions.yml')).toString());
    for (let [key, reaction] of Object.entries(res)) {
        if (reaction.images.length === 0) {
            continue;
        }
        reactions[key] = reaction;
        commands.push({
            name: key,
            type: 'MESSAGE',
        });
    }
}
const buttons = [
    new discord_js_1.MessageActionRow()
        .addComponents(new discord_js_1.MessageButton()
        .setStyle('SECONDARY')
        .setEmoji('❌')
        .setCustomId('doubt'))
];
const presetEmbed = {
    askForDoubt: {
        embeds: [
            new discord_js_1.MessageEmbed()
                .setDescription('You asked for doubt.')
                .setColor('BLUE')
        ],
        ephemeral: true,
    },
    askForDoubtFailed: {
        embeds: [
            new discord_js_1.MessageEmbed()
                .setDescription("Sorry, I can't help you to ask for doubt at here.")
                .setColor('RED')
        ],
        ephemeral: true,
    },
    doubt: {
        embeds: [
            new discord_js_1.MessageEmbed()
                .setDescription('You doubted.')
                .setColor('BLUE')
        ],
        ephemeral: true,
    },
    doubtFailed: {
        embeds: [
            new discord_js_1.MessageEmbed()
                .setDescription("Sorry, I can't help you to doubt here.")
                .setColor('RED')
        ],
        ephemeral: true,
    },
    reactionFailed: {
        embeds: [
            new discord_js_1.MessageEmbed()
                .setDescription("Failed to give reaction.")
                .setColor('RED')
        ],
        ephemeral: true,
    }
};
const intents = new discord_js_1.Intents()
    .add(discord_js_1.Intents.FLAGS.GUILDS)
    .add(discord_js_1.Intents.FLAGS.GUILD_MESSAGES);
const client = new discord_js_1.Client({ intents });
function randomByte() {
    return 128 + Math.floor(Math.random() * 128);
}
function handleDoubtButton(button) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let channel = button.channel;
            if (!channel) {
                let guild = yield client.guilds.fetch(button.guildId);
                channel = (yield guild.channels.fetch(button.channelId));
            }
            let message = button.message instanceof discord_js_1.Message ?
                button.message : yield channel.messages.fetch(button.message.id);
            let source = yield message.fetchReference();
            let embed = new discord_js_1.MessageEmbed()
                .setColor([randomByte(), randomByte(), randomByte()])
                .setDescription(`${button.user} doubted.`)
                .setTimestamp(new Date());
            yield source.reply({ embeds: [embed] });
            yield button.reply(presetEmbed.doubt);
        }
        catch (_) {
            yield button.reply(presetEmbed.doubtFailed);
        }
    });
}
function handleDoubtContext(context) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let channel = context.channel;
            if (!channel) {
                let guild = yield client.guilds.fetch(context.guildId);
                channel = (yield guild.channels.fetch(context.channelId));
            }
            let message = yield channel.messages.fetch(context.targetId);
            let embed = new discord_js_1.MessageEmbed()
                .setColor([randomByte(), randomByte(), randomByte()])
                .setTitle('Press ❌ to doubt.')
                .setDescription(`${context.user} wants to doubt.`)
                .setTimestamp(new Date());
            yield message.reply({
                embeds: [embed],
                components: buttons
            });
            yield context.reply(presetEmbed.askForDoubt);
        }
        catch (_) {
            yield context.reply(presetEmbed.askForDoubtFailed);
        }
    });
}
function handleReactionContext(context) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let channel = context.channel;
            if (!channel) {
                let guild = yield client.guilds.fetch(context.guildId);
                channel = (yield guild.channels.fetch(context.channelId));
            }
            let message = yield channel.messages.fetch(context.targetId);
            let sample = reactions[context.commandName].images;
            let embed = new discord_js_1.MessageEmbed()
                .setColor([randomByte(), randomByte(), randomByte()])
                .setDescription((0, util_1.format)(reactions[context.commandName].text, context.user.toString()))
                .setImage(sample[Math.floor(Math.random() * sample.length)])
                .setTimestamp(new Date());
            yield message.reply({
                embeds: [embed],
            });
            yield context.reply({
                embeds: [
                    new discord_js_1.MessageEmbed()
                        .setDescription((0, util_1.format)(reactions[context.commandName].text, 'you'))
                        .setColor('BLUE')
                ],
                ephemeral: true,
            });
        }
        catch (_) {
            yield context.reply(presetEmbed.reactionFailed);
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
    let guilds = yield client.guilds.fetch();
    while (guilds.size > 0) {
        let latest = undefined;
        for (let apiGuild of guilds.values()) {
            latest = apiGuild.id;
            try {
                let guild = yield apiGuild.fetch();
                if (!guild.commands) {
                    continue;
                }
                yield guild.commands.set(commands);
            }
            catch (err) {
                console.warn(err);
            }
        }
        guilds = yield client.guilds.fetch({ after: latest });
    }
}))().catch(console.error));
client.on('guildCreate', (guild) => (() => __awaiter(void 0, void 0, void 0, function* () {
    yield guild.commands.set(commands)
        .catch(console.warn);
}))().catch(console.error));
client.on('interactionCreate', (interaction) => (() => __awaiter(void 0, void 0, void 0, function* () {
    if (interaction.isButton()) {
        return handleDoubtButton(interaction);
    }
    if (interaction.isContextMenu()) {
        if (interaction.commandName === 'Ask for Doubt') {
            return handleDoubtContext(interaction);
        }
        else {
            return handleReactionContext(interaction);
        }
    }
}))().catch(console.error));
client.login(process.env.DISCORD_TOKEN)
    .catch(console.error);

//# sourceMappingURL=index.js.map
