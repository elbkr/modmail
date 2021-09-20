const ticketModel = require("../../models/ticket");
const blockModel = require("../../models/block");
const config = require("../../json/config.json");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "block",
  description: "Block someone from using the modmail system",
  userPerms: ["BAN_MEMBERS"],
  botPerms: ["MANAGE_CHANNELS", "EMBED_LINKS"],
  async execute(client, message, args, prefix) {
    let mention = message.mentions.members.first();
    let logs = await message.guild.channels.fetch(config.logs);

    if (mention) {
      // check if user is alredy blocked
      const blocked = await blockModel.findOne({
        _id: mention.id,
      });

      if (blocked) return message.reply("That user is alredy blocked");

      // set the reason
      let reason = args[1] ? args.slice(1).join(" ") : "Not provided";

      // create blok doc
      const newBlock = new blockModel({
        _id: mention.id,
        reason: reason,
      });

      await newBlock.save().catch(console.error);

      // check if the blocked user had a ticket and delete it
      const ticket = await ticketModel.findOne({
        _id: mention.id,
      });

      if (ticket) {
        const ticketCh = await message.guild.channels.fetch(ticket.channel);
        ticketCh.delete("Ticket owner was blocked");

        await ticketModel
          .findOneAndDelete({
            _id: mention.id,
          })
          .catch(console.error);
      }

      message
        .reply(`Succesfully blocked ${mention} from using the modmail system`)
        .catch(console.error);

      // alternate image (author)
      const avatarGif = message.author.displayAvatarURL({
        dynamic: true,
      });

      const avatarPng = message.author.displayAvatarURL({
        type: "png",
      });

      let avatar = avatarGif.includes(".gif") ? avatarGif : avatarPng;

      // alternate image (user)
      const userGif = mention.user.displayAvatarURL({
        dynamic: true,
      });

      const userPng = mention.user.displayAvatarURL({
        type: "png",
      });

      let userAvatar = userGif.includes(".gif") ? userGif : userPng;

      // send user blocked log
      const blockEmbed = new MessageEmbed()
        .setAuthor(message.author.username, avatar)
        .setColor("#f54542")
        .setTitle("User blocked")
        .setThumbnail(userAvatar)
        .addField("User ID", mention.id)
        .setTimestamp();
      logs.send({ embeds: [blockEmbed] });

      // send alert embed to the user
      const blockDM = new MessageEmbed()
        .setAuthor(message.author.username, avatar)
        .setColor("#42c5f5")
        .setTitle("User blocked")
        .setDescription(`You were blocked from using the modmail system`)
        .addField("Reason", reason)
        .setFooter("If you think we made a mistake, contact us in the server");

      mention.send({ embeds: [blockDM] }).catch(console.log);
    } else {
      const member = await message.guild.members.fetch(args[0]);

      if ((!member && !mention) || !member)
        return message.reply("Specify a correct user or id");

      // check if user is alredy blocked
      const blocked = await blockModel.findOne({
        _id: member.id,
      });

      if (blocked) return message.reply("That user is alredy blocked");

      // set the reason
      let reason = args[1] ? args.slice(1).join(" ") : "Not provided";

      // create blok doc
      const newBlock = new blockModel({
        _id: member.id,
        reason: reason,
      });

      await newBlock.save().catch(console.error);

      // check if the blocked user had a ticket and delete it
      const ticket = await ticketModel.findOne({
        _id: member.id,
      });

      if (ticket) {
        await ticketModel
          .findOneAndDelete({
            _id: member.id,
          })
          .catch(console.error);
      }

      if (ticket.channel != message.channel.id) {
        message
          .reply(`Succesfully blocked ${member} from using the modmail system`)
          .catch(console.error);
      }

      // alternate image (author)
      const avatarGif = message.author.displayAvatarURL({
        dynamic: true,
      });

      const avatarPng = message.author.displayAvatarURL({
        type: "png",
      });

      let avatar = avatarGif.includes(".gif") ? avatarGif : avatarPng;

      // alternate image (user)
      const userGif = member.user.displayAvatarURL({
        dynamic: true,
      });

      const userPng = member.user.displayAvatarURL({
        type: "png",
      });

      let userAvatar = userGif.includes(".gif") ? userGif : userPng;

      // send user blocked log
      const blockEmbed = new MessageEmbed()
        .setAuthor(message.author.username, avatar)
        .setColor("#f54542")
        .setTitle("User blocked")
        .setThumbnail(userAvatar)
        .addField("User ID", member.id)
        .setTimestamp();
      logs.send({ embeds: [blockEmbed] });

      // send alert embed to the user
      const blockDM = new MessageEmbed()
        .setAuthor(message.author.username, avatar)
        .setColor("#42c5f5")
        .setTitle("User blocked")
        .setDescription(`You were blocked from using the modmail system`)
        .addField("Reason", reason)
        .setFooter("If you think we made a mistake, contact us in the server");

      member.send({ embeds: [blockDM] }).catch(console.log);
    }
  },
};
