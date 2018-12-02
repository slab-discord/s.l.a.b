const Discord = require('discord.js');
const client = new Discord.Client();
const talkedRecently = new Set(); //whats this for?
const config = require('./botconfig.json');

client.on("ready", () => {
console.log('Bot ready');
client.user.setActivity(`${client.guilds.size} servers. s!help`)
});

client.on("guildCreate", guild => {
client.channels.get('517912350435835904').send(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
client.user.setActivity(`${client.guilds.size} servers. s!help`);
});
client.on("guildDelete", guild => {
client.channels.get('517912350435835904').send(`Left a guild: ${guild.name} (id: ${guild.id}).`);
client.user.setActivity(`${client.guilds.size} servers. s!help`);
});

client.on("message", async message => {
if(message.author.bot) return;
if(message.channel.type == 'DM') return;

let args = message.content.slice(config.prefix.length).trim().split(' ');
let command = args.shift().toLowerCase();

if(command === 'say') {
message.channel.send(args.join(" "));
} else if(command === 'kick') {
let kicked = message.mentions.users.first();
if(!message.member.hasPermission('KICK_MEMBERS')) return message.channel.send('You don\'t have permission to kick members.');
if(!kicked) return message.channel.send('Please provide someone to kick.');

if(!message.guild.member(kicked).kickable) return message.channel.send('They have a higher role/administrator or i don\'t have permissions to kick.');
let reason = args.slice(kicked.length).join(" ");

await message.guild.member(kicked).kick(reason)
.catch(error => message.channel.send(`Sorry ${message.author} I couldn't kick because of : ${error}`));
message.channel.send(`${kicked.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);

} else if(command === 'ban') {
if(!message.member.hasPermission('BAN_MEMBERS')) return message.channel.send('You don\'t have permission to ban members.');

let member = message.mentions.members.first();
if(!member) return message.reply("Please mention a valid member of this server");
if(!member.bannable) return message.reply("They have a higher role/administrator or i don\'t have permissions to ban.");
let reason = args.slice(member).join(' ');
if(!reason) reason = "No reason provided";
await member.ban(reason)
.catch(error => message.channel.send(`Sorry ${message.author} I couldn't ban because of : ${error}`));
message.channel.send(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);

} else if(command === "purge") {
if(!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send('You don\'t have permission to purge messages.');
const deleteCount = parseInt(args[0], 10);
if(!deleteCount || deleteCount < 2 || deleteCount > 100)
return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
const fetched = await message.channel.fetchMessages({limit: deleteCount});
message.channel.bulkDelete(fetched)
.catch(error => message.reply(`Could not delete messages because of: ${error}`));
} else if(command === "ping") {
const m = await message.channel.send("Ping");
m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
} else if(command === "help") {
message.channel.send(new Discord.RichEmbed() 
.setTitle('Help')
.addField('s!say', 'Make me say something')
.addField('s!purge', 'Purge up to 100 messages.')
.addField('s!kick', 'Kick a member.')
.addField('s!ban', 'Ban a member.')
.addField('s!ping', 'Pong! See how fast im running.'));
}

});

client.login(process.env.TOKEN);
