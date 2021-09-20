const Discord = require("discord.js");
const { readTime } = require("../../functions/readtime");

module.exports = async (message, cooldowns) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  let client = message.client;

  if (!message.guild.me.permissionsIn(message.channel).has("SEND_MESSAGES"))
    return;

  let p = client.prefix;

  if (!message.content.startsWith(p)) return;

  const args = message.content.substring(p.length).trim().split(" ");
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );

  if (!command) return;

  // user permissions handler
  if (!message.member.permissions.has(command.userPerms || []))
    return message.reply("Ey ey ey! You can't use that command");

  // bot permissions handler
  if (!message.guild.me.permissions.has(command.botPerms || []))
    return message.reply(
      `Ups :/  I need ${command.botPerms} to run this command correctly`
    );

  // cooldowns
  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;

      const tleft1 = Math.round(timeLeft.toFixed(3));
      let tleft = readTime(tleft1);

      return message
        .reply(`Please wait ${tleft} before using \`${command.name}\` again.`)
        .then((msg) => {
          msg.delete({ timeout: 5000 });
        });
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    //async execute(client, message, args, prefix)
    command.execute(client, message, args, p, cooldowns);
  } catch (error) {
    console.error(error);
    message.channel
      .send("There was an error executing that command.")
      .then((msg) => {
        setTimeout(() => {
          msg.delete();
        }, 5000);
      })
      .catch(console.error);
  }
};
