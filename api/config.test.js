const test = require("node:test");
const assert = require("node:assert/strict");

const { buildPublicConfig } = require("./config");

test("buildPublicConfig exposes only public browser settings", () => {
  const config = buildPublicConfig({ META_PIXEL_ID: "123456", META_CAPI_TOKEN: "secret" });

  assert.deepEqual(config, {
    metaPixelId: "123456",
  });
});
