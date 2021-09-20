const ticketModel = require("../../models/ticket");
const config = require("../../json/config.json");
const { MessageEmbed } = require("discord.js");

const { isImage } = require("../../functions/isImage");

module.exports = {
  name: "close",
  description: "Close a ticket",
  userPerms: ["BAN_MEMBERS"],
  botPerms: ["MANAGE_CHANNELS", "EMBED_LINKS"],
  async execute(client, message, args, prefix) {
    const user = message.mentions.users.first();
    let logs = await message.guild.channels.fetch(config.logs);

    if (user) {
      const ticket = await ticketModel.findOne({ _id: user.id });

      if (!ticket)
        return message.reply("There is no ticket opened by that user");

      // generate random 4 digits code and send it
      const code = Math.floor(1000 + Math.random() * 9000);

      const codeEmbed = new MessageEmbed()
        .setTitle("Close confirmation")
        .setColor("#f5bc42")
        .setDescription(
          "To close the ticket, Write the 4 digit code you will find in this message."
        )
        .addField("Code", `${code}`)
        .setFooter("This process will time out after 60 seconds");

      const msg = await message.channel.send({ embeds: [codeEmbed] });

      // start a collector of the 4 digits code

      const filter = (m) =>
        m.content.trim() == `${code}` && m.author.id == message.author.id;
      const collector = message.channel.createMessageCollector({
        filter,
        time: 60000,
        max: 1,
      });

      collector.on("collect", async () => {
        msg.delete().catch(console.error);
        message
          .reply(
            "The ticket will be closed in 15 seconds. I will notify the user about it."
          )
          .catch(console.error);
        setTimeout(async () => {
          // delete the ticket channel
          const ticketCh = await message.guild.channels.fetch(ticket.channel);
          ticketCh.delete(`Ticket closed by ${message.author.id}`);

          // delete the ticket from db
          await ticketModel.findOneAndDelete({ _id: user.id });

          // alternate image (author)
          const avatarGif = message.author.displayAvatarURL({
            dynamic: true,
          });

          const avatarPng = message.author.displayAvatarURL({
            type: "png",
          });

          let avatar = avatarGif.includes(".gif") ? avatarGif : avatarPng;

          // alternate image (user)
          const userGif = user.user.displayAvatarURL({
            dynamic: true,
          });

          const userPng = user.user.displayAvatarURL({
            type: "png",
          });

          let userAvatar = userGif.includes(".gif") ? userGif : userPng;

          // send ticket closed log
          const closeEmbed = new MessageEmbed()
            .setAuthor(message.author.username, avatar)
            .setColor("#f54542")
            .setTitle("Ticket closed")
            .setThumbnail(userAvatar)
            .addField("User ID", user.id)
            .setFooter(`Ticket ID: ${ticket.channel}`)
            .setTimestamp();

          logs.send({ embeds: [closeEmbed] });

          // send ticket closed embed to the user
          const closeDM = new MessageEmbed()
            .setAuthor(message.author.username, avatar)
            .setColor("#42c5f5")
            .setTitle("Ticket closed")
            .setDescription(`Thanks for contacting the staff!`)
            .setFooter("Answer this message to create a new ticket.");

          if (args[1])
            closeDM.addField("Reason", `\`${args.slice(1).join(" ")}\``);
          if (
            message.attachments.size > 0 &&
            isImage(message.attachments.first().name)
          )
            closeDM.setImage(message.attachments.first().url);

          user.send({ embeds: [closeDM] }).catch(console.log);
        }, 15000);
      });

      // If the user didn't type the 4 digits code
      collector.on("end", (c) => {
        if (c.size == 0)
          msg
            .edit({
              content: `:x: The time ended and I didn't receive any answer!`,
              embeds: [],
            })
            .catch((e) => console.log(new Error(e)));
      });
    } else {
      const ticket = await ticketModel.findOne({ channel: message.channel.id });

      if (!ticket)
        return message.reply("This channel doesn't belong to a ticket");

      // get the ticket user
      const user = await message.guild.members.fetch(ticket._id);

      // generate random 4 digits code and send it
      const code = Math.floor(1000 + Math.random() * 9000);

      const codeEmbed = new MessageEmbed()
        .setTitle("Close confirmation")
        .setColor("#f5bc42")
        .setDescription(
          "To close the ticket, Write the 4 digit code you will find in this message."
        )
        .addField("Code", `${code}`)
        .setFooter("This process will time out after 60 seconds");

      const msg = await message.channel.send({ embeds: [codeEmbed] });

      // start a collector of the 4 digits code

      const filter = (m) =>
        m.content.trim() == `${code}` && m.author.id == message.author.id;
      const collector = message.channel.createMessageCollector({
        filter,
        time: 60000,
        max: 1,
      });

      collector.on("collect", async () => {
        msg.delete().catch(console.error);
        message
          .reply(
            "The ticket will be closed in 15 seconds. I will notify the user about it."
          )
          .catch(console.error);
        setTimeout(async () => {
          // delete the ticket channel
          message.channel.delete(`Ticket closed by ${message.author.id}`);

          // delete the ticket from db
          await ticketModel.findOneAndDelete({ channel: message.channel.id });

          // alternate image (author)
          const avatarGif = message.author.displayAvatarURL({
            dynamic: true,
          });

          const avatarPng = message.author.displayAvatarURL({
            type: "png",
          });

          let avatar = avatarGif.includes(".gif") ? avatarGif : avatarPng;

          // alternate image (user)
          const userGif = user.user.displayAvatarURL({
            dynamic: true,
          });

          const userPng = user.user.displayAvatarURL({
            type: "png",
          });

          let userAvatar = userGif.includes(".gif") ? userGif : userPng;

          // send ticket closed log
          const closeEmbed = new MessageEmbed()
            .setAuthor(message.author.username, avatar)
            .setColor("#f54542")
            .setTitle("Ticket closed")
            .setThumbnail(userAvatar)
            .addField("User ID", user.id)
            .setFooter(`Ticket ID: ${message.channel.id}`)
            .setTimestamp();

          logs.send({ embeds: [closeEmbed] });

          // send ticket closed embed to the user
          const closeDM = new MessageEmbed()
            .setAuthor(message.author.username, avatar)
            .setColor("#42c5f5")
            .setTitle("Ticket closed")
            .setDescription(`Thanks for contacting the staff!`)
            .setFooter("Answer this message to create a new ticket.");

          if (args[1])
            closeDM.addField("Reason", `\`${args.slice(1).join(" ")}\``);
          if (
            message.attachments.size > 0 &&
            isImage(message.attachments.first().name)
          )
            closeDM.setImage(message.attachments.first().url);

          user.send({ embeds: [closeDM] }).catch(console.log);
        }, 15000);
      });

      // If the user didn't type the 4 digits code
      collector.on("end", (c) => {
        if (c.size == 0)
          msg
            .edit({
              content: `:x: The time ended and I didn't receive any answer!`,
              embeds: [],
            })
            .catch((e) => console.log(new Error(e)));
      });
    }
  },
};
