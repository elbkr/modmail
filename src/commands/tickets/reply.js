const ticketModel = require("../../models/ticket");
const config = require("../../json/config.json");
const { MessageEmbed } = require("discord.js");
const { isImage } = require("../../functions/isImage");

module.exports = {
  name: "reply",
  description: "Send a message to the tixket owner",
  userPerms: ["BAN_MEMBERS"],
  botPerms: ["EMBED_LINKS"],
  async execute(client, message, args, prefix) {
    let logs = await message.guild.channels.fetch(config.logs);

    const ticket = await ticketModel.findOne({ channel: message.channel.id });

    if (!ticket)
      return message.reply("This channel doesn't belong to a ticket");

    // fetch user
    const user = await message.guild.members.fetch(ticket._id);

    const content = args.join(" ");

    if (!args[0]) return message.reply("Specify the message you want to send");

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
    // if the message has an attach
    if (message.attachments.size > 0) {
      let url = message.attachments.first().proxyURL;
      let name = url.slice(url.lastIndexOf("/") + 1);

      const sendThis = args[0]
        ? `${content}\n [File URL](${url})`
        : `[File URL](${url})`;

      const replyEmbed = new MessageEmbed()
        .setAuthor(message.author.username, avatar)
        .setDescription(sendThis)
        .setColor("#42c5f5")
        .setTimestamp();
      if (isImage(name)) {
        replyEmbed.setImage(url);
      } else {
        replyEmbed.setFooter("WARNING: This file may be dangerous");
      }

      user
        .send({
          embeds: [replyEmbed],
        })
        .then(message.react(client.myemojis.get("sent")));

      // send message sent log
      let text = args[0]
        ? `${content}\n [File URL](${url})`
        : `[File URL](${url})`;

      const sentEmbed = new MessageEmbed()
        .setAuthor(message.author.username, avatar)
        .setColor("#42c5f5")
        .setTitle("Message sent")
        .setThumbnail(userAvatar)
        .setDescription(text)
        .addField("User ID", ticket._id)
        .setFooter(`Ticket ID: ${ticket.channel}`)
        .setTimestamp();

      logs.send({ embeds: [sentEmbed] });
    } else {
      // send message to user
      const replyDM = new MessageEmbed()
        .setAuthor(message.author.username, avatar)
        .setDescription(content)
        .setColor("#42c5f5")
        .setTimestamp();

      user
        .send({ embeds: [replyDM] })
        .then(message.react(client.myemojis.get("sent")));

      // send Message sent log
      const sentEmbed = new MessageEmbed()
        .setAuthor(message.author.username, avatar)
        .setColor("#42c5f5")
        .setTitle("Message sent")
        .setThumbnail(userAvatar)
        .setDescription(content)
        .addField("User ID", ticket._id)
        .setFooter(`Ticket ID: ${ticket.channel}`)
        .setTimestamp();

      logs.send({ embeds: [sentEmbed] });
    }
  },
};
