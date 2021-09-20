const ticketModel = require("../../models/ticket");
const blockModel = require("../../models/block");
const config = require("../../json/config.json");
const { Permissions, MessageEmbed } = require("discord.js");
const { isImage } = require("../../functions/isImage");

module.exports = async (message) => {
  if (message.author.bot || message.channel.type != "DM") return;

  let client = message.client;
  let author = message.author;
  let content = message.content;

  // alternate image
  const avatarGif = author.displayAvatarURL({
    dynamic: true,
  });

  const avatarPng = author.displayAvatarURL({
    type: "png",
  });

  let avatar = avatarGif.includes(".gif") ? avatarGif : avatarPng;

  // look for ticket or blocked user
  const ticket = await ticketModel.findOne({ _id: author.id });
  const blocked = await blockModel.findOne({ _id: author.id });

  // fetch guild, logs & category
  let guild = await client.guilds.fetch(config.guild);
  let logs = await guild.channels.fetch(config.logs);
  let parent = await guild.channels.fetch(config.category);

  // If there is no ticket do this
  if (!ticket) {
    // If the user is blocked
    if (blocked) {
     return message.react(client.myemojis.get("blocked"));
    }

    // create channel
    const channel = await guild.channels
      .create(author.username, {
        type: "GUILD_TEXT",
        topic: `${author.username} support ticket`,
        parent: parent,
        permissionOverwrites: [
          { id: guild.roles.everyone, deny: [Permissions.FLAGS.VIEW_CHANNEL] },
        ],
      })
      .catch(console.error);

    // create ticket doc in mongodb
    const newTicket = new ticketModel({
      _id: author.id,
      channel: channel.id,
    });

    await newTicket.save().catch(console.error);

    // send new ticket log message
    const createEmbed = new MessageEmbed()
      .setAuthor(author.username, avatar)
      .setColor("#42f578")
      .setTitle("Ticket created")
      .setThumbnail(avatar)
      .addField("User ID", author.id)
      .setFooter(`Ticket ID: ${channel.id}`)
      .setTimestamp();

    logs.send({ embeds: [createEmbed] });

    // look for webhook, and if there isn't, create one
    let webhook = await channel.fetchWebhooks();
    let modHook = webhook.find((x) => x.name === author.username);

    if (!modHook) {
      modHook = await channel.createWebhook(author.username, {
        avatar: author.displayAvatarURL({ format: "png" }),
      });
    }

    // if the message has an attach
    if (message.attachments.size > 0) {
      let url = message.attachments.first().proxyURL;
      let name = url.slice(url.lastIndexOf("/") + 1);

      const hookEmbed = new MessageEmbed()
        .setTitle("File URL")
        .setURL(url)
        .setColor("#0099ff");

      if (isImage(name)) {
        hookEmbed.setImage(url);
      } else {
        hookEmbed.setFooter("WARNING: This file may be dangerous");
      }
      const sendThis = content.length > 0 ? content : " ";

      modHook
        .send({
          content: sendThis,
          embeds: [hookEmbed],
        })
        .then(message.reply("Message sent! Wait while the staff answers you."));

      // send message received log
      let text =
        content.length > 0
          ? `${content}\n [File URL](${url})`
          : `[File URL](${url})`;

      const receivedEmbed = new MessageEmbed()
        .setAuthor(author.username, avatar)
        .setColor("#42c5f5")
        .setTitle("Message received")
        .setThumbnail(avatar)
        .setDescription(text)
        .addField("User ID", author.id)
        .setFooter(`Ticket ID: ${channel.id}`)
        .setTimestamp();

      logs.send({ embeds: [receivedEmbed] });
    } else {
      modHook
        .send(content)
        .then(message.reply("Message sent! Wait while the staff answers you."));

      // send message received log
      const receivedEmbed = new MessageEmbed()
        .setAuthor(author.username, avatar)
        .setColor("#42c5f5")
        .setTitle("Message received")
        .setThumbnail(avatar)
        .setDescription(content)
        .addField("User ID", author.id)
        .setFooter(`Ticket ID: ${channel.id}`)
        .setTimestamp();

      logs.send({ embeds: [receivedEmbed] });
    }
  }

  // if there is alredy a ticket do this
  if (ticket) {
    // If the user is blocked
    if (blocked) {
      await ticketModel.findOneAndDelete({
        _id: author.id,
      });

      return message.reply("You are blocked from using the modmail system");
    }

    const channel = await guild.channels.fetch(ticket.channel);

    // look for webhook, and if there isn't, create one
    let webhook = await channel.fetchWebhooks();
    let modHook = webhook.find((x) => x.name === author.username);

    if (!modHook) {
      modHook = await channel.createWebhook(author.username, {
        avatar: author.displayAvatarURL({ format: "png" }),
      });
    }

    // if the message has an attach
    if (message.attachments.size > 0) {
      let url = message.attachments.first().proxyURL;
      let name = url.slice(url.lastIndexOf("/") + 1);

      const hookEmbed = new MessageEmbed()
        .setTitle("File URL")
        .setURL(url)
        .setColor("#0099ff");

      if (isImage(name)) {
        hookEmbed.setImage(url);
      } else {
        hookEmbed.setFooter("WARNING: This file may be dangerous");
      }
      const sendThis = content.length > 0 ? content : " ";

      modHook
        .send({
          content: sendThis,
          embeds: [hookEmbed],
        })
        .then(message.react(client.myemojis.get("sent")));

      // send message received log
      let text =
        content.length > 0
          ? `${content}\n [File URL](${url})`
          : `[File URL](${url})`;

      const answerEmbed = new MessageEmbed()
        .setAuthor(author.username, avatar)
        .setColor("#42c5f5")
        .setTitle("Message received")
        .setThumbnail(avatar)
        .setDescription(text)
        .addField("User ID", author.id)
        .setFooter(`Ticket ID: ${channel.id}`)
        .setTimestamp();

      logs.send({ embeds: [answerEmbed] });
    } else {
      modHook.send(content).then(message.react(client.myemojis.get("sent")));

      // send Message received log
      const answerEmbed = new MessageEmbed()
        .setAuthor(author.username, avatar)
        .setColor("#42c5f5")
        .setTitle("Message received")
        .setThumbnail(avatar)
        .setDescription(content)
        .addField("User ID", author.id)
        .setFooter(`Ticket ID: ${channel.id}`)
        .setTimestamp();

      logs.send({ embeds: [answerEmbed] });
    }
  }
};
