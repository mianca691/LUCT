const request = require("supertest");
const app = require("../src/app");

describe("GET /ping", () => {
  it("should return pong", async () => {
    const res = await request(app).get("/ping");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "pong" });
  });
});
