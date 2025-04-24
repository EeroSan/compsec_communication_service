import chai from "chai";
import chaiHttp from "chai-http";
import express from "express";

import {
  validateLoginCredentials,
  whitelistFields,
  validateEmail,
  validatePassword,
  validateRequest,
} from "../../middleware/validationMiddleware.js";

const { expect } = chai;
chai.use(chaiHttp);

const app = express();
app.use(express.json());

// Dummy controller (just sends 200 OK)
const success = (_, res) => res.sendStatus(200);

// Clean validation test routes
app.post("/login", validateLoginCredentials, success);
app.post(
  "/login-strict",
  whitelistFields(["email", "password"]),
  validateLoginCredentials,
  success
);
app.post("/signup", validateEmail, validatePassword, validateRequest, success);

describe("Validation Middleware", () => {
  describe("Login Validation", () => {
    it("should pass with valid email and password", async () => {
      const res = await chai.request(app).post("/login").send({
        email: "valid@example.com",
        password: "securePassword123!",
      });
      expect(res).to.have.status(200);
    });

    it("should fail with missing email", async () => {
      const res = await chai.request(app).post("/login").send({
        password: "securePassword123!",
      });
      expect(res).to.have.status(400);
      expect(res.body.errors).to.be.an("array");
      const error = res.body.errors.find((err) => err.path === "email");
      expect(error, "Missing email error not found").to.exist;
    });

    it("should fail with invalid email", async () => {
      const res = await chai.request(app).post("/login").send({
        email: "not-an-email",
        password: "securePassword123!",
      });
      expect(res).to.have.status(400);
      expect(res.body.errors).to.be.an("array");
      const error = res.body.errors.find((err) => err.path === "email");
      expect(error, "Invalid email error not found").to.exist;
    });

    it("should fail with short password", async () => {
      const res = await chai.request(app).post("/login").send({
        email: "valid@example.com",
        password: "short",
      });
      expect(res).to.have.status(400);
      expect(res.body.errors).to.be.an("array");
      const error = res.body.errors.find((err) => err.path === "password");
      expect(error, "Short password error not found").to.exist;
    });
  });

  describe("Signup Validation", () => {
    it("should fail with special characters in email", async () => {
      const res = await chai.request(app).post("/signup").send({
        email: "bad<>@example.com",
        password: "securePassword123!",
      });
      expect(res).to.have.status(400);
      expect(res.body.errors).to.be.an("array");
      const error = res.body.errors.find((err) => err.path === "email");
      expect(error, "Invalid email format error not found").to.exist;
    });

    it("should pass with valid email and password", async () => {
      const res = await chai.request(app).post("/signup").send({
        email: "good@example.com",
        password: "securePassword123!",
      });
      expect(res).to.have.status(200);
    });
  });

  describe("Extra middleware coverage", () => {
    it("should fail whitelistFields when extra fields are sent", async () => {
      const res = await chai.request(app).post("/login-strict").send({
        email: "user@example.com",
        password: "securePassword123!",
        role: "admin", // extra
      });
      expect(res).to.have.status(400);
      expect(res.body.error).to.include("Unexpected fields");
    });

    it("should pass whitelistFields when only allowed fields are sent", async () => {
      const res = await chai.request(app).post("/login-strict").send({
        email: "user@example.com",
        password: "securePassword123!",
      });
      expect(res).to.have.status(200);
    });
  });
});
