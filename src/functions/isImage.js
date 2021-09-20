module.exports.isImage = isImage;

const extensions = require("../json/extensions.json");
const path = require("path");

const imageExtensions = new Set(extensions.images);
const unsafeExtensions = new Set(extensions.unsafe);

function isImage(f) {
  if (
    imageExtensions.has(path.extname(f).slice(1).toLowerCase())
  )
    return true;
  else if (
    unsafeExtensions.has(path.extname(f).slice(1).toLowerCase())
  )
    return false;
  else false;
}
