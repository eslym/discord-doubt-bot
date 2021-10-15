import {
    ApplicationCommandData,
    ButtonInteraction,
    Client,
    ContextMenuInteraction,
    Intents, InteractionReplyOptions,
    Message, MessageActionRow,
    MessageButton, MessageEmbed, OAuth2Guild, ReplyMessageOptions, Snowflake, TextBasedChannels
} from 'discord.js';
import moment = require("moment");
import Dict = NodeJS.Dict;

const commands: ApplicationCommandData[] = [
    {
        name: 'Ask for Doubt',
        type: 'MESSAGE',
    }
]

const buttons: MessageActionRow[] = [
    new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setStyle('SECONDARY')
                .setEmoji('❌')
                .setCustomId('doubt')
        )
]

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
}

const intents = new Intents()
    .add(Intents.FLAGS.GUILDS)
    .add(Intents.FLAGS.GUILD_MESSAGES)

const client = new Client({intents});

function randomByte() {
    return 128 + Math.floor(Math.random() * 128);
}

async function handleButton(button: ButtonInteraction) {
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
            .setFooter(moment().format('D MMM YYYY, hh:mm A'), button.user.avatarURL());
        await source.reply({embeds: [embed]});
        await button.reply(presetEmbed.doubt);
    } catch (_) {
        await button.reply(presetEmbed.doubtFailed);
    }
}

async function handleContextMenu(context: ContextMenuInteraction) {
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
            .setFooter(moment().format('D MMM YYYY, hh:mm A'), context.user.avatarURL());
        await message.reply({
            embeds: [embed],
            components: buttons
        });
        await context.reply(presetEmbed.askForDoubt);
    } catch (_) {
        await context.reply(presetEmbed.askForDoubtFailed);
    }
}

client.on('ready', () => (async () => {
    let link = new URL('https://discord.com/oauth2/authorize');
    link.searchParams.set('client_id', client.application.id);
    link.searchParams.set('scope', 'bot applications.commands');
    link.searchParams.set('permissions', '274877975552');
    console.log('Use this link to invite bot:');
    console.log(link.toString());
    let guilds = await client.guilds.fetch();
    while(guilds.size > 0){
        let latest: Snowflake = undefined;
        for (let apiGuild of guilds.values()){
            latest = apiGuild.id;
            try{
                let guild = await apiGuild.fetch();
                if (!guild.commands) {
                    continue;
                }
                await guild.commands.set(commands);
            } catch (err){
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
        return handleButton(interaction);
    }
    if (interaction.isContextMenu()) {
        return handleContextMenu(interaction);
    }
})().catch(console.error));

client.login(process.env.DISCORD_TOKEN)
    .catch(console.error);
