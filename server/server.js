// This entry file forwards startup to the actual backend server source file.
// It prevents route mismatch issues when running `node server.js` directly.
require("./src/server");
