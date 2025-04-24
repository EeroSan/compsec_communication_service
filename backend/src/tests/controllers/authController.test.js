import * as authController from "../../controllers/authController.js";
import { __test_helpers__, signup, login } from "../../controllers/authController.js";


import chai from "chai";
import sinon from "sinon";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { afterEach, beforeEach, describe, it } from "mocha";

const { expect } = chai;

describe("authController", () => {
  let req, res, sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = { body: {}, headers: {} };
    res = {
      status: sandbox.stub().returnsThis(),
      json: sandbox.stub(),
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  // === Unit tests for helpers ===

  describe("validateEmailAndPassword", () => {
    it("should return true for valid inputs", () => {
      expect(
        __test_helpers__.validateEmailAndPassword("a@b.com", "abc")
      ).to.be.true;
    });
    it("should return false for invalid inputs", () => {
      expect(__test_helpers__.validateEmailAndPassword(null, "")).to.be
        .false;
    });
  });

  describe("hashPassword / comparePasswords", () => {
    it("should hash and validate password correctly", async () => {
      const password = "secure";
      const hash = await __test_helpers__.hashPassword(password);
      const result = await __test_helpers__.comparePasswords(
        password,
        hash
      );
      expect(result).to.be.true;
    });
  });

  describe("generateTokens", () => {
    it("should return valid tokens", () => {
      const tokens = __test_helpers__.generateTokens({
        id: 1,
        email: "a@b.com",
      });
      expect(tokens).to.have.keys(["accessToken", "refreshToken"]);
    });
  });



  // === Refresh Token ===
  describe("refreshToken", () => {
    it("should return 400 if missing", async () => {
      req.body = {};
      await authController.refreshToken(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should return 403 for invalid token", async () => {
      req.body = { email: "a@b.com", refreshToken: "invalid" };
      sandbox.stub(jwt, "verify").throws();

      await authController.refreshToken(req, res);
      expect(res.status.calledWith(403)).to.be.true;
    });
  });

  // === Logout ===
  describe("logout", () => {
    it("should return 403 for invalid token", async () => {
      req.body = { email: "a@b.com" };
      req.headers.authorization = "Bearer badtoken";
      sandbox.stub(jwt, "verify").throws();

      await authController.logout(req, res);
      expect(res.status.calledWith(403)).to.be.true;
    });
  });
});
