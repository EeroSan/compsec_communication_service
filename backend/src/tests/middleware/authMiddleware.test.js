import { describe, it } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { authenticateToken } from "../../../src/middleware/authMiddleware.js";

dotenv.config();

const VALID_SECRET = process.env.ACCESS_TOKEN_SECRET;

describe("authenticateToken Middleware", () => {
  const fakeUser = {
    id: 1,
    email: "test@example.com",
  };

  const generateToken = (user, secret = VALID_SECRET, expiresIn = "15m") => {
    return jwt.sign(user, secret, { expiresIn });
  };

  const buildMockRes = () => {
    const res = {};
    res.status = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);
    return res;
  };

  it("should call next() for valid token and email match", async () => {
    const token = generateToken(fakeUser);
    const req = {
      headers: { authorization: `Bearer ${token}` },
      body: { email: "test@example.com" },
    };
    const res = buildMockRes();
    const next = sinon.spy();

    await authenticateToken(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(res.status.notCalled).to.be.true;
  });

  it("should return 401 if token is missing", async () => {
    const req = { headers: {}, body: { email: "test@example.com" } };
    const res = buildMockRes();
    const next = sinon.spy();

    await authenticateToken(req, res, next);

    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWithMatch({ message: "Access token required" })).to.be
      .true;
    expect(next.notCalled).to.be.true;
  });

  it("should return 403 if email does not match token", async () => {
    const token = generateToken(fakeUser);
    const req = {
      headers: { authorization: `Bearer ${token}` },
      body: { email: "wrong@example.com" },
    };
    const res = buildMockRes();
    const next = sinon.spy();

    await authenticateToken(req, res, next);

    expect(res.status.calledWith(403)).to.be.true;
    expect(
      res.json.calledWithMatch({
        message: "Invalid access token for this user.",
      })
    ).to.be.true;
    expect(next.notCalled).to.be.true;
  });

  it("should return 403 for expired/invalid token", async () => {
    const token = generateToken(fakeUser, "wrong_secret");
    const req = {
      headers: { authorization: `Bearer ${token}` },
      body: { email: "test@example.com" },
    };
    const res = buildMockRes();
    const next = sinon.spy();

    await authenticateToken(req, res, next);

    expect(res.status.calledWith(403)).to.be.true;
    expect(res.json.calledWithMatch({ message: "Invalid or expired token" })).to
      .be.true;
    expect(next.notCalled).to.be.true;
  });
});
