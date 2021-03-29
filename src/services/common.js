const isJsonParsable = function (string) {
  return new Promise((resolve, reject) => {
    try {
        JSON.parse(string);
    } catch (e) {
        resolve(false);
    }
    resolve(true);
  });
};

module.exports = { isJsonParsable };


