const ticketDoc = require("../../models/ticket");

module.exports = async (channel) => {
  const ticket = await ticketDoc.findOne({ channel: channel.id });

  if (ticket) {
    await ticketDoc.findOneAndDelete({
      channel: channel.id,
    }).catch(console.error)

    console.log("Deleted ticket doc because channel was deleted")
  }
};
