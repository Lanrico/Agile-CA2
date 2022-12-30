import chai from "chai";
import request from "supertest";
const mongoose = require("mongoose");
import api from "../../../../index";

// set up seed data for datastore
const expect = chai.expect;
let db;

describe("Trending endpoint", () => {
  before(() => {
    mongoose.connect(process.env.MONGO_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = mongoose.connection;
  });

  after(async () => {
    try {
      await db.dropDatabase();
    } catch (error) {
      console.log(error);
    }
  });
  afterEach(() => {
    api.close(); // Release PORT 8080
  });
  describe("GET /api/trending/tmdb/:type/:time_window", () => {
    describe("for valid type and valid time window", () => {
      describe("when type is movie and time window is day", () => {
        it("should a list of 20 trending movies and a status 200", () => {
          return request(api)
            .get("/api/trending/tmdb/movie/day")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)
            .then((res) => {
              expect(res.body.results[0]).to.have.property("overview");
              expect(res.body.results).to.be.a("array");
              expect(res.body.results.length).to.equal(20);
            });
        });
      });
      describe("when type is movie and time window is week", () => {
        it("should a list of 20 trending movies and a status 200", () => {
          return request(api)
            .get("/api/trending/tmdb/movie/week")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)
            .then((res) => {
              expect(res.body.results[0]).to.have.property("overview");
              expect(res.body.results).to.be.a("array");
              expect(res.body.results.length).to.equal(20);
            });
        });
      });
      describe("when type is person and time window is day", () => {
        it("should a list of 20 trending people and a status 200", () => {
          return request(api)
            .get("/api/trending/tmdb/person/day")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)
            .then((res) => {
              expect(res.body.results[0]).to.have.property("gender");
              expect(res.body.results).to.be.a("array");
              expect(res.body.results.length).to.equal(20);
            });
        });
      });
      describe("when type is person and time window is week", () => {
        it("should a list of 20 trending people and a status 200", () => {
          return request(api)
            .get("/api/trending/tmdb/person/day")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)
            .then((res) => {
              expect(res.body.results[0]).to.have.property("gender");
              expect(res.body.results).to.be.a("array");
              expect(res.body.results.length).to.equal(20);
            });
        });
      });
    });
    describe("for invalid type and valid time window", () => {
      it("should return a status 404 and the corresponding message", () => {
        return request(api)
          .get("/api/trending/tmdb/miku/day")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .expect({ message: 'Invalid trending type or time_window.', status_code: 404 });
      });
    });
    describe("for valid type and invalid time window", () => {
      it("should return a status 404 and the corresponding message", () => {
        return request(api)
          .get("/api/trending/tmdb/person/miku")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .expect({ message: 'Invalid trending type or time_window.', status_code: 404 });
      });
    });
    describe("for invalid type and invalid time window", () => {
      it("should return a status 404 and the corresponding message", () => {
        return request(api)
          .get("/api/trending/tmdb/miku/miku")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .expect({ message: 'Invalid trending type or time_window.', status_code: 404 });
      });
    });
  });
});
