require('dotenv').config();
const ApiClient = require('./services/shiprocket/lib/api-client');
async function run() {
  try {
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;
    console.log("Using email:", email);
    const client = new ApiClient(email, password);
    const token = await client.login();
    console.log("SUCCESS! Got token:", token.substring(0, 15) + "...");
  } catch (e) {
    console.error("FAILED TO LOGIN:", e.message);
  }
}
run();
