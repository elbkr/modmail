require("dotenv").config({ path: "src/.env" });

const chalk = require("chalk");

const { Client, Collection, Intents } = require("discord.js");
const client = new Client({
  allowedMentions: { parse: ["users", "roles"] },
  partials: ["CHANNEL"],
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_WEBHOOKS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_INVITES,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
});

const { loadCommands } = require("./utilities/loadcmds.js");
const { loadEmojis } = require("./utilities/loademojis.js");
const { loadEvents } = require("./utilities/loadevents.js");
const { nodeEvents } = require("./utilities/nodeevents.js");
const { prefix } = require("./json/config.json");

client.login(process.env.token).then(() => {
  console.log(
    chalk.bgBlueBright.black(
      ` Successfully logged in as: ${client.user.username}#${client.user.discriminator} `
    )
  );
});

client.myemojis = new Collection();
client.commands = new Collection();
client.prefix = prefix;

loadEvents(client);
loadCommands(client);
loadEmojis(client);
nodeEvents(process);
