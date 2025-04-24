import { describe, it, beforeEach, afterEach } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import * as deviceController from "../../../src/controllers/deviceController.js";
import Redis from "ioredis";

describe("Device Controller", () => {
  let redisStub, req, res, next;

  beforeEach(() => {
    // Stub Redis methods
    redisStub = sinon.stub(Redis.prototype);
    req = { body: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("registerDevice", () => {
    it("should return 400 if required fields are missing", async () => {
      await deviceController.registerDevice(req, res);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ message: "Missing required fields." }))
        .to.be.true;
    });

    it("should store device info and return 201 when valid", async () => {
      req.body = {
        email: "test@example.com",
        device_id: "abc123",
        device_type: "master",
        ip_address: "192.168.1.1",
        port: "3000",
      };
      redisStub.get.resolves(null); // No existing devices
      redisStub.set.resolves();

      await deviceController.registerDevice(req, res);
      expect(res.status.calledWith(201)).to.be.true;
      expect(
        res.json.calledWithMatch({ message: "Device registered successfully." })
      ).to.be.true;
    });

    it("should return 400 if more than 2 devices exist", async () => {
      req.body = {
        email: "test@example.com",
        device_id: "abc123",
        device_type: "master",
        ip_address: "192.168.1.1",
        port: "3000",
      };
      redisStub.get.resolves(
        JSON.stringify([{ device_id: "1" }, { device_id: "2" }])
      );

      await deviceController.registerDevice(req, res);
      expect(res.status.calledWith(400)).to.be.true;
      expect(
        res.json.calledWithMatch({
          message: "User already has two devices registered.",
        })
      ).to.be.true;
    });
  });

  describe("getConnectionInfo", () => {
    it("should return 400 if email is missing", async () => {
      await deviceController.getConnectionInfo(req, res);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ message: "Email is required." })).to.be
        .true;
    });

    it("should return connection info if two devices exist", async () => {
      req.body = { email: "test@example.com" };
      const mockDevices = [{ id: "1" }, { id: "2" }];
      redisStub.get.resolves(JSON.stringify(mockDevices));

      await deviceController.getConnectionInfo(req, res);
      expect(
        res.json.calledWithMatch({
          message: "WebSocket connection info retrieved.",
          devices: mockDevices,
        })
      ).to.be.true;
    });

    it("should return 400 if device count is not 2", async () => {
      req.body = { email: "test@example.com" };
      redisStub.get.resolves(JSON.stringify([{ id: "only-one" }]));

      await deviceController.getConnectionInfo(req, res);
      expect(res.status.calledWith(400)).to.be.true;
      expect(
        res.json.calledWithMatch({
          message: "User must have exactly two registered devices.",
        })
      ).to.be.true;
    });
  });

  describe("deleteDevices", () => {
    it("should delete devices and call next()", async () => {
      req.body = { email: "test@example.com" };
      redisStub.del.resolves();

      await deviceController.deleteDevices(req, res, next);
      expect(next.calledOnce).to.be.true;
    });

    it("should return 400 if email is missing", async () => {
      await deviceController.deleteDevices(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ message: "Email is required." })).to.be
        .true;
    });
  });
});
