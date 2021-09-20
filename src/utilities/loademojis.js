function loadEmojis(client) {
  const emojis = require("../json/emojis.json");

  for (const key in emojis) {
    client.myemojis.set(emojis[key].name, emojis[key].id);
  }
}

module.exports = {
  loadEmojis,
};
