import request from "supertest";
import app from "../src/app.js";

async function runTests() {
  try {
    const res = await request(app).get("/ping");

    // Update assertion to match JSON response
    if (res.statusCode === 200 && res.body.message === "pong") {
      console.log("✅ Test passed: GET /ping returned pong");
    } else {
      console.error(
        `❌ Test failed: GET /ping returned status ${res.statusCode}, body: ${JSON.stringify(res.body)}`
      );
    }
  } catch (err) {
    console.error("❌ Test failed with error:", err);
  }
}

runTests();
