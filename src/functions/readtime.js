module.exports.readTime = readTime;

function readTime(t) {
  let s = t % 60;
  t -= s;
  let m = (t / 60) % 60;
  t -= m * 60;
  let h = (t / 3600) % 24;

  if (m <= 0) {
    return `${s} seconds`;
  } else if (h <= 0) {
    return `${m} min`;
  } else {
    return `${h}h`;
  }
}
