const ticketModel = require("../../models/ticket");
const config = require("../../json/config.json");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "topic",
  description: "Set the topic of a ticket,",
  userPerms: ["BAN_MEMBERS"],
  botPerms: ["MANAGE_CHANNELS","EMBED_LINKS"],
  async execute(client, message, args, prefix) {
    const user = message.mentions.users.first();
    let logs = await message.guild.channels.fetch(config.logs);

    if (user) {
      const ticket = await ticketModel.findOne({ _id: user.id });

      if (!ticket)
        return message.reply("There is no ticket opened by that user");

      const topic = args.slice(1).join(" ");

      if (!topic)
        return message.reply("Please specify the topic you want to set");

      if (topic.length > 1024)
        return message.reply("The topic can't have more than 1024 characters");

      // change ticket channel topic
      const ticketCh = await message.guild.channels.fetch(ticket.channel);
      ticketCh.setTopic(`${user.username} support ticket | ${topic}`);

      message.reply(`Succesfully set the ticket topic to \`${topic}\``);

      // alternate image (author)
      const avatarGif = message.author.displayAvatarURL({
        dynamic: true,
      });

      const avatarPng = message.author.displayAvatarURL({
        type: "png",
      });

      let avatar = avatarGif.includes(".gif") ? avatarGif : avatarPng;

      // alternate image (user)
      const userGif = user.displayAvatarURL({
        dynamic: true,
      });

      const userPng = user.displayAvatarURL({
        type: "png",
      });

      let userAvatar = userGif.includes(".gif") ? userGif : userPng;

      // send topic changed log
      const topicEmbed = new MessageEmbed()
        .setAuthor(message.author.username, avatar)
        .setColor("#f5bc42")
        .setTitle("Topic changed")
        .setDescription(topic)
        .setThumbnail(userAvatar)
        .addField("User ID", user.id)
        .setFooter(`Ticket ID: ${ticket.channel}`)
        .setTimestamp();

      logs.send({ embeds: [topicEmbed] });
    } else {
      const ticket = await ticketModel.findOne({ channel: message.channel.id });

      if (!ticket)
        return message.reply("This channel doesn't belong to a ticket");

      // get the ticket user
      const user = await message.guild.members.fetch(ticket._id);
      const topic = args.join(" ");

      if (!topic)
        return message.reply("Please specify the topic you want to set");

      // change ticket channel topic
      const ticketCh = await message.guild.channels.fetch(ticket.channel);
      ticketCh.setTopic(`${user.user.username} support ticket | ${topic}`);

      message.reply(`Succesfully set the ticket topic to \`${topic}\``);

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

      // send Topic changed log
      const topicEmbed = new MessageEmbed()
        .setAuthor(message.author.username, avatar)
        .setColor("#f5bc42")
        .setTitle("Topic changed")
        .setDescription(topic)
        .setThumbnail(userAvatar)
        .addField("User ID", user.id)
        .setFooter(`Ticket ID: ${message.channel.id}`)
        .setTimestamp();

      logs.send({ embeds: [topicEmbed] });
    }
  },
};
