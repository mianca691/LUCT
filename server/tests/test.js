import request from "supertest";
import app from "../src/app.js"; // import app only

async function runTests() {
  try {
    const res = await request(app).get("/ping");

    if (res.statusCode === 200 && res.body.message === "pong") {
      console.log("✅ Test passed: GET /ping returned pong");
    } else {
      console.error(
        `❌ Test failed: GET /ping returned status ${res.statusCode}, body: ${JSON.stringify(res.body)}`
      );
    }

    process.exit(0); // <-- exit after tests
  } catch (err) {
    console.error("❌ Test failed with error:", err);
    process.exit(1); // exit with error code
  }
}

runTests();
