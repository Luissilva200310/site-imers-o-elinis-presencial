function buildPublicConfig(env = process.env) {
  return {
    metaPixelId: env.META_PIXEL_ID || "",
  };
}

function handler(req, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(buildPublicConfig()));
}

module.exports = handler;
module.exports.buildPublicConfig = buildPublicConfig;
