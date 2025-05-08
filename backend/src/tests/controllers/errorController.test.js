import chai from "chai";
import chaiHttp from "chai-http";
import express from "express";
import { handleInvalidEndpoint } from "../../controllers/errorController.js";
import { describe, it, beforeEach } from "mocha";

const { expect } = chai;
chai.use(chaiHttp);

describe("Error Controller", () => {
  let app;

  // Setup Express app for testing
  beforeEach(() => {
    app = express();
    app.all("*", handleInvalidEndpoint);
  });

  it("should return 404 and an error message for invalid endpoints", (done) => {
    chai
      .request(app)
      .get("/invalid")
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("success", false);
        expect(res.body).to.have.property(
          "message",
          "This endpoint is disabled or not available."
        );
        done();
      });
  });

  it("should return 404 and an error message for any HTTP method (POST)", (done) => {
    chai
      .request(app)
      .post("/invalid")
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("success", false);
        expect(res.body).to.have.property(
          "message",
          "This endpoint is disabled or not available."
        );
        done();
      });
  });

  it("should return 404 and an error message for any HTTP method (PUT)", (done) => {
    chai
      .request(app)
      .put("/some/invalid")
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("success", false);
        expect(res.body).to.have.property(
          "message",
          "This endpoint is disabled or not available."
        );
        done();
      });
  });

  it("should return 404 and an error message for any HTTP method (DELETE)", (done) => {
    chai
      .request(app)
      .delete("/yet/another/invalid")
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("success", false);
        expect(res.body).to.have.property(
          "message",
          "This endpoint is disabled or not available."
        );
        done();
      });
  });

  it("should return 404 and an error message for any HTTP method (PATCH)", (done) => {
    chai
      .request(app)
      .patch("/patch/invalid")
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("success", false);
        expect(res.body).to.have.property(
          "message",
          "This endpoint is disabled or not available."
        );
        done();
      });
  });
});
