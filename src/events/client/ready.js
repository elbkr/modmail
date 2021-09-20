const chalk = require("chalk");
const mongoose = require("mongoose");

module.exports = (client) => {
  client.user.setActivity("Send me a message!", { type: "WATCHING" });

  let allMembers = new Set();
  client.guilds.cache.forEach((guild) => {
    guild.members.cache.forEach((member) => {
      allMembers.add(member.user.id);
    });
  });

  let allChannels = new Set();
  client.guilds.cache.forEach((guild) => {
    guild.channels.cache.forEach((channel) => {
      allChannels.add(channel.id);
    });
  });

  console.log(
    chalk.bgMagentaBright.black(` ${client.guilds.cache.size} servers `),
    chalk.bgMagentaBright.black(` ${client.channels.cache.size} channels `),
    chalk.bgMagentaBright.black(` ${allMembers.size} members `)
  );

  mongoose
    .connect(process.env.mongo_url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(
      console.log(
        chalk.bgGreenBright.black(
          ` ${client.user.username} connecting to Mongo DB `
        )
      )
    )
    .catch((err) =>
      console.log(
        chalk.bgRedBright.black(
          ` ${client.user.username} could not connect to mongo DB ` + err
        )
      )
    );
};
