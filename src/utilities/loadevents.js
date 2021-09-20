const clientEvent = (event) => require(`../events/client/${event}`);
const guildEvent = (event) => require(`../events/guild/${event}`);
const otherEvent = (event) => require(`../events/other/${event}`);
const Discord = require("discord.js");

function loadEvents(client) {
  const cooldowns = new Discord.Collection();

  // client events
  client.on("ready", () => clientEvent("ready")(client));
  client.on("messageCreate", (m) => clientEvent("mention")(m, client));

  // guild events
  client.on("messageCreate", (m) => guildEvent("command")(m, cooldowns));

  // other events
  client.on("messageCreate", (m) => otherEvent("dmMessage")(m));
  client.on("channelDelete", (c) => otherEvent("channelDelete")(c,));
  client.on("guildMemberRemove", (m) => otherEvent("userLeft")(m));
  //client.on("interactionCreate", (i) => otherEvent("interaction")(i, client));

  // warnings and errors
  client.on("warn", (info) => console.log(info));
  client.on("error", console.error);


}

module.exports = {
  loadEvents,
};
