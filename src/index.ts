import {
    ApplicationCommandData,
    ButtonInteraction,
    Client,
    ContextMenuInteraction,
    Intents,
    InteractionReplyOptions,
    Message,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    MessageSelectMenu, SelectMenuInteraction,
    Snowflake,
    TextBasedChannels
} from 'discord.js';
import {format} from "util";
import path = require('path');
import fs = require('fs');
import YAML = require('yaml');
import Dict = NodeJS.Dict;

const root = path.resolve(__dirname, '..');

const commands: ApplicationCommandData[] = [
    {
        name: 'Ask for Doubt',
        type: 'MESSAGE',
    }
]

interface ReactionList {
    text: string,
    images: string[]
}

const reactions: Dict<ReactionList> = {};

if (fs.existsSync(path.resolve(root, 'reactions.yml'))) {
    let res = YAML.parse(fs.readFileSync(path.resolve(root, 'reactions.yml')).toString()) as Dict<ReactionList>;
    for (let [key, reaction] of Object.entries(res)) {
        if (reaction.images.length === 0) {
            continue;
        }
        reactions[key] = reaction;
    }
    commands.push({
        name: 'Random Reaction',
        type: "MESSAGE",
    });
}

const buttons: MessageActionRow[] = [
    new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setStyle('SECONDARY')
                .setEmoji('❌')
                .setCustomId('doubt')
        )
];

const presetEmbed: Dict<InteractionReplyOptions> = {
    askForDoubt: {
        embeds: [
            new MessageEmbed()
                .setDescription('You asked for doubt.')
                .setColor('BLUE')
        ],
        ephemeral: true,
    },

    askForDoubtFailed: {
        embeds: [
            new MessageEmbed()
                .setDescription("Sorry, I can't help you to ask for doubt at here.")
                .setColor('RED')
        ],
        ephemeral: true,
    },

    doubt: {
        embeds: [
            new MessageEmbed()
                .setDescription('You doubted.')
                .setColor('BLUE')
        ],
        ephemeral: true,
    },

    doubtFailed: {
        embeds: [
            new MessageEmbed()
                .setDescription("Sorry, I can't help you to doubt here.")
                .setColor('RED')
        ],
        ephemeral: true,
    },

    reaction: {
        embeds: [
            new MessageEmbed()
                .setDescription('Select a type of reaction to give reaction')
                .setColor('BLUE')
        ],
    },

    reactionFailed: {
        embeds: [
            new MessageEmbed()
                .setDescription("Failed to give reaction.")
                .setColor('RED')
        ],
        ephemeral: true,
    }
}

const intents = new Intents()
    .add(Intents.FLAGS.GUILDS)
    .add(Intents.FLAGS.GUILD_MESSAGES)

const client = new Client({intents});

function randomByte() {
    return 128 + Math.floor(Math.random() * 128);
}

async function handleDoubtButton(button: ButtonInteraction) {
    try {
        let channel = button.channel;
        if (!channel) {
            let guild = await client.guilds.fetch(button.guildId);
            channel = await guild.channels.fetch(button.channelId) as TextBasedChannels;
        }
        let message: Message = button.message instanceof Message ?
            button.message : await channel.messages.fetch(button.message.id);
        let source = await message.fetchReference();
        let embed = new MessageEmbed()
            .setColor([randomByte(), randomByte(), randomByte()])
            .setDescription(`${button.user} doubted.`)
            .setTimestamp(new Date());
        await source.reply({embeds: [embed]});
        await button.reply(presetEmbed.doubt);
    } catch (_) {
        await button.reply(presetEmbed.doubtFailed);
    }
}

async function handleDoubtContext(context: ContextMenuInteraction) {
    try {
        let channel = context.channel;
        if (!channel) {
            let guild = await client.guilds.fetch(context.guildId);
            channel = await guild.channels.fetch(context.channelId) as TextBasedChannels;
        }
        let message: Message = await channel.messages.fetch(context.targetId);
        let embed = new MessageEmbed()
            .setColor([randomByte(), randomByte(), randomByte()])
            .setTitle('Press ❌ to doubt.')
            .setDescription(`${context.user} wants to doubt.`)
            .setTimestamp(new Date());
        await message.reply({
            embeds: [embed],
            components: buttons
        });
        await context.reply(presetEmbed.askForDoubt);
    } catch (_) {
        await context.reply(presetEmbed.askForDoubtFailed);
    }
}

async function handleReactionContext(context: ContextMenuInteraction){
    try {
        let menu = new MessageSelectMenu()
            .setCustomId('reaction')
            .setPlaceholder('Select an reaction type to react.')
            .setOptions(Object.entries(reactions).map(e=>({
                label: e[0],
                description: format(e[1].text, 'you'),
                value: `${context.targetId};${e[0]}`
            })));
        let msg: InteractionReplyOptions = {
            embeds: presetEmbed.reaction.embeds,
            components: [new MessageActionRow({components: [menu]})],
            ephemeral: true
        }
        await context.reply(msg);
    } catch (_) {
        await context.reply(presetEmbed.reactionFailed);
    }
}

async function handleSelectMenu(context: SelectMenuInteraction) {
    try {
        let [msgid, type] = context.values[0].split(';');
        let sample = reactions[type].images;
        let embed = new MessageEmbed()
            .setColor([randomByte(), randomByte(), randomByte()])
            .setDescription(format(reactions[type].text, context.user.toString()))
            .setImage(sample[Math.floor(Math.random() * sample.length)])
            .setTimestamp(new Date());
        let message = await context.channel.messages.fetch(msgid);
        await message.reply({
            embeds: [embed],
        });
        await context.update(presetEmbed.reaction);
    } catch (_) {
        await context.reply(presetEmbed.reactionFailed);
    }
}

client.on('ready', () => (async () => {
    let link = new URL('https://discord.com/oauth2/authorize');
    link.searchParams.set('client_id', client.application.id);
    link.searchParams.set('scope', 'bot applications.commands');
    link.searchParams.set('permissions', '274878123008');
    console.log('Use this link to invite bot:');
    console.log(link.toString());
    let guilds = await client.guilds.fetch();
    while (guilds.size > 0) {
        let latest: Snowflake = undefined;
        for (let apiGuild of guilds.values()) {
            latest = apiGuild.id;
            try {
                let guild = await apiGuild.fetch();
                if (!guild.commands) {
                    continue;
                }
                await guild.commands.set(commands);
            } catch (err) {
                console.warn(err);
            }
        }
        guilds = await client.guilds.fetch({after: latest});
    }
})().catch(console.error));

client.on('guildCreate', (guild) => (async () => {
    await guild.commands.set(commands)
        .catch(console.warn);
})().catch(console.error));

client.on('interactionCreate', (interaction) => (async () => {
    if (interaction.isButton()) {
        return handleDoubtButton(interaction);
    }
    if (interaction.isSelectMenu()){
        return handleSelectMenu(interaction);
    }
    if (interaction.isContextMenu()) {
        if (interaction.commandName === 'Ask for Doubt') {
            return handleDoubtContext(interaction);
        } else {
            return handleReactionContext(interaction);
        }
    }
})().catch(console.error));

client.login(process.env.DISCORD_TOKEN)
    .catch(console.error);
