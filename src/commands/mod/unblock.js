const ticketModel = require("../../models/ticket");
const blockModel = require("../../models/block");
const config = require("../../json/config.json");
const { MessageEmbed } = require("discord.js");
const block = require("./block");

module.exports = {
  name: "unblock",
  description: "Unblock someone from using the modmail system",
  userPerms: ["BAN_MEMBERS"],
  botPerms: ["EMBED_LINKS"],
  async execute(client, message, args, prefix) {
    let mention = message.mentions.members.first();
    let logs = await message.guild.channels.fetch(config.logs);

    if (mention) {
      // check if user is blocked
      const blocked = await blockModel.findOne({
        _id: mention.id,
      });

      if (!blocked) return message.reply("That user is not blocked");

      // delete blok doc
      await blockModel
        .findOneAndDelete({ _id: mention.id })
        .catch(console.error);

      message
        .reply(`Succesfully unblocked ${mention} from using the modmail system`)
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
      const unblockEmbed = new MessageEmbed()
        .setAuthor(message.author.username, avatar)
        .setColor("#42f578")
        .setTitle("User unblocked")
        .setThumbnail(userAvatar)
        .addField("User ID", mention.id)
        .setTimestamp();
      logs.send({ embeds: [unblockEmbed] });

      // send alert embed to the user
      const unblockDM = new MessageEmbed()
        .setAuthor(message.author.username, avatar)
        .setColor("#42c5f5")
        .setTitle("User unblocked")
        .setDescription(`You were unblocked from using the modmail system`)
        .setFooter("Send me a message to contact staff");

      mention.send({ embeds: [unblockDM] }).catch(console.log);
    } else {
      const member = await message.guild.members.fetch(args[0]);

      if ((!member && !mention) || !member)
        return message.reply("Specify a correct user or id");

      // check if user is blocked
      const blocked = await blockModel.findOne({
        _id: member.id,
      });

      if (!blocked) return message.reply("That user is not blocked");

      // delete blok doc
      await blockModel
        .findOneAndDelete({ _id: mention.id })
        .catch(console.error);

      message
        .reply(`Succesfully unblocked ${member} from using the modmail system`)
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
      const userGif = member.user.displayAvatarURL({
        dynamic: true,
      });

      const userPng = member.user.displayAvatarURL({
        type: "png",
      });

      let userAvatar = userGif.includes(".gif") ? userGif : userPng;

      // send user unblocked log
      const unblockEmbed = new MessageEmbed()
        .setAuthor(message.author.username, avatar)
        .setColor("#42f578")
        .setTitle("User unblocked")
        .setThumbnail(userAvatar)
        .addField("User ID", member.id)
        .setTimestamp();
      logs.send({ embeds: [unblockEmbed] });

      // send alert embed to the user
      const unblockDM = new MessageEmbed()
        .setAuthor(message.author.username, avatar)
        .setColor("#42c5f5")
        .setTitle("User unblocked")
        .setDescription(`You were unblocked from using the modmail system`);

      member.send({ embeds: [unblockDM] }).catch(console.log);
    }
  },
};
