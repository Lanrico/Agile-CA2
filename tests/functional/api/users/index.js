import chai from "chai";
import request from "supertest";
const mongoose = require("mongoose");
import User from "../../../../api/users/userModel";
import users from "../../../../seedData/users";
import api from "../../../../index";

const expect = chai.expect;
let db;
let user1;
let user1token;
let user1Id;

describe("Users endpoint", () => {
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
  beforeEach(async () => {
    try {
      await User.deleteMany();
      // Register two users
      await request(api).post("/api/users?action=register").send({
        username: "user1",
        password: "test1",
      });
      await request(api).post("/api/users?action=register").send({
        username: "user2",
        password: "test2",
      });
      await request(api).post("/api/users/user1/favourites").send({
        id: 411
      });
    } catch (err) {
      console.error(`failed to Load user test Data: ${err}`);
    }
  });
  afterEach(() => {
    api.close();
  });
  describe("GET /api/users ", () => {
    it("should return the 2 users and a status 200", (done) => {
      request(api)
        .get("/api/users")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .end((err, res) => {
          expect(res.body).to.be.a("array");
          expect(res.body.length).to.equal(2);
          let result = res.body.map((user) => user.username);
          expect(result).to.have.members(["user1", "user2"]);
          done();
        });
    });
  });

  describe("POST /api/users ", () => {
    describe("For a register action", () => {
      describe("when the payload is correct", () => {
        it("should return a 201 status and the confirmation message", () => {
          return request(api)
            .post("/api/users?action=register")
            .send({
              username: "user3",
              password: "test3",
            })
            .expect(201)
            .expect({ msg: "Successful created new user.", code: 201 });
        });
        after(() => {
          return request(api)
            .get("/api/users")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)
            .then((res) => {
              expect(res.body.length).to.equal(3);
              const result = res.body.map((user) => user.username);
              expect(result).to.have.members(["user1", "user2", "user3"]);
            });
        });
      });
    });
    describe("For an authenticate action", () => {
      describe("when the payload is correct", () => {
        it("should return a 200 status and a generated token", () => {
          return request(api)
            .post("/api/users?action=authenticate")
            .send({
              username: "user1",
              password: "test1",
            })
            .expect(200)
            .then((res) => {
              expect(res.body.success).to.be.true;
              expect(res.body.token).to.not.be.undefined;
              user1token = res.body.token.substring(7);
            });
        });
      });
    });
  });

  // 
  // 
  // 
  // 
  // 
  // 
  //   

  describe("POST /api/users/:userName/favourites", () => {
    describe("for valid user name", () => {
      describe("when the movie is not in favourites", () => {
        it("should return user message and a status 201", () => {
          return request(api)
            .post(`/api/users/${users[0].username}/favourites`)
            .send({
              id: 77660
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(201)
            .then((res) => {
              expect(res.body).to.have.property("username", users[0].username);
              expect(res.body.favourites.length).to.equal(2);
            });
        });
      });
      describe("when the movie is in favourites", () => {
        it("return error message and a status 404", () => {
          return request(api)
            .post(`/api/users/${users[0].username}/favourites`)
            .send({
              id: 411
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(404)
            .expect({ code: 404, msg: 'Already in favourites' })
        });
      });
    });
  });
  describe("GET /api/users/:userName/favourites", () => {
    it("should return the favourites list and status 200", () => {
      return request(api)
        .get(`/api/users/${users[0].username}/favourites`)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .then((res) => {
          expect(res.body).to.be.a("array");
        });
    });
  });
  describe("POST /api/users/:userName/favourites/remove", () => {
    describe("for valid user name", () => {
      describe("when the movie is in favourites", () => {
        it("should return user message and a status 201", () => {
          return request(api)
            .post(`/api/users/${users[0].username}/favourites/remove`)
            .send({
              id: 411
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(201)
            .then((res) => {
              expect(res.body).to.have.property("username", users[0].username);
              expect(res.body.favourites.length).to.equal(0);
            });
        });
      });
      describe("when the movie is not in favourites", () => {
        it("return error message and a status 404", () => {
          return request(api)
            .post(`/api/users/${users[0].username}/favourites/remove`)
            .send({
              id: 76600
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(404)
            .expect({ code: 404, msg: 'Not in favourites' })
        });
      });
    });
  });

  describe("GET /api/users/:userName/recommendation", () => {
    describe("when the user have favourites", () => {
      it("should return a list of recommand movies and a status 200", () => {
        return request(api)
          .get(`/api/users/${users[0].username}/recommendation`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .then((res) => {
            expect(res.body).to.be.a("array");
            expect(res.body).to.not.have.length(0);
          });
      });
    });
    describe("when the user do not have any favourites", () => {
      it("return an empty array and a status 201", () => {
        return request(api)
          .get(`/api/users/${users[1].username}/recommendation`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(201)
          .then((res) => {
            expect(res.body).to.be.a("array");
            expect(res.body).to.have.length(0);
          });
      });
    });
  });
});

