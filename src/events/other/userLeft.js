const blockDoc = require("../../models/block");

modulue.exports = async (member) => {
  const block = await blockDoc.findOne({ _id: member.id });

  if (block) {
    await blockDoc
      .findOneAndDelete({
        _id: member.id,
      })
      .catch(console.error);
  }
  console.log("Deleted block Doc because member left");
};
