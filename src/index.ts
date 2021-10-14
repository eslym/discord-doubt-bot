import {
    ApplicationCommandData,
    ButtonInteraction,
    Client,
    ContextMenuInteraction,
    Intents,
    Message, MessageActionRow,
    MessageButton, TextBasedChannels
} from 'discord.js';

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

const intents = new Intents()
    .add(Intents.FLAGS.GUILDS)
    .add(Intents.FLAGS.GUILD_MESSAGES)

const client = new Client({intents});

async function handleButton(button: ButtonInteraction){
    let channel = button.channel;
    if(!channel){
        let guild = await client.guilds.fetch(button.guildId);
        channel = await guild.channels.fetch(button.channelId) as TextBasedChannels;
    }
    let message: Message = button.message instanceof Message ?
        button.message : await channel.messages.fetch(button.message.id);
    let source = await message.fetchReference();
    try{
        await source.reply(`${button.user.toString()} doubted.`);
        await button.reply({content: 'You doubted.', ephemeral: true});
    } catch (_) {
        await button.reply({content: "Sorry, I can't help you to ask for doubt at here.", ephemeral: true});
    }
}

async function handleContextMenu(context: ContextMenuInteraction){
    let channel = context.channel;
    if(!channel){
        let guild = await client.guilds.fetch(context.guildId);
        channel = await guild.channels.fetch(context.channelId) as TextBasedChannels;
    }
    let message: Message = await channel.messages.fetch(context.targetId);
    try{
        await message.reply({
            content: 'Press ❌ to doubt.',
            components: buttons
        });
        await context.reply({content: 'You asked for doubt.', ephemeral: true});
    } catch (_) {
        await context.reply({content: "Sorry, I can't help you to ask for doubt at here.", ephemeral: true});
    }
}

client.on('ready', ()=>(async ()=>{
    let link = new URL('https://discord.com/oauth2/authorize');
    link.searchParams.set('client_id', client.application.id);
    link.searchParams.set('scope', 'bot applications.commands');
    link.searchParams.set('permissions', '274877975552');
    console.log('Use this link to invite bot:');
    console.log(link.toString());
    let guilds = await client.guilds.fetch({});
    for(let guildData of guilds.values()){
        let guild = await guildData.fetch();
        if(!guild.commands){
            continue;
        }
        await guild.commands.set(commands)
            .catch(console.warn);
    }
})().catch(console.error));

client.on('guildCreate', (guild)=>(async ()=>{
    await guild.commands.set(commands)
        .catch(console.warn);
})().catch(console.error));

client.on('interactionCreate', (interaction)=>(async ()=>{
    if(interaction.isButton()){
        return handleButton(interaction);
    }
    if (interaction.isContextMenu()){
        return handleContextMenu(interaction);
    }
})().catch(console.error));

client.login(process.env.DISCORD_TOKEN)
    .catch(console.error);
