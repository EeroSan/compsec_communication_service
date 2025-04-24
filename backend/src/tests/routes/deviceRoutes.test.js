import { describe, it, beforeEach } from "mocha";
import request from "supertest";
import jwt from "jsonwebtoken";
import { expect } from "chai";
import dotenv from "dotenv";
import app from "../../../server.js"; // make sure app is exported, not server.listen()
import Redis from "ioredis";

dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
});

const testEmail = "test@example.com";
const testToken = jwt.sign(
  { id: 1, email: testEmail },
  process.env.ACCESS_TOKEN_SECRET,
  { expiresIn: "1h" }
);

describe("Device Routes", () => {
  beforeEach(async () => {
    await redis.del(testEmail); // clear any previous device registration
  });

  it("should register a device", async () => {
    const response = await request(app)
      .post("/api/device/register")
      .set("Authorization", `Bearer ${testToken}`)
      .send({
        email: testEmail,
        device_id: "abc123",
        device_type: "master",
        ip_address: "192.168.1.2",
        port: 8080,
      });

    expect(response.status).to.equal(201);
    expect(response.body.message).to.equal("Device registered successfully.");
  });

  it("should return connection info when 2 devices are registered", async () => {
    // Register two devices first
    const registerDevice = (deviceId) =>
      request(app)
        .post("/api/device/register")
        .set("Authorization", `Bearer ${testToken}`)
        .send({
          email: testEmail,
          device_id: deviceId,
          device_type: "slave",
          ip_address: "127.0.0.1",
          port: 9000,
        });

    await registerDevice("dev1");
    await registerDevice("dev2");

    const res = await request(app)
      .post("/api/device/connection-info")
      .set("Authorization", `Bearer ${testToken}`)
      .send({ email: testEmail });

    expect(res.status).to.equal(200);
    expect(res.body.devices).to.have.lengthOf(2);
  });

  it("should reject access without token", async () => {
    const res = await request(app)
      .post("/api/device/connection-info")
      .send({ email: testEmail });

    expect(res.status).to.equal(401);
    expect(res.body.message).to.equal("Access token required");
  });
});
