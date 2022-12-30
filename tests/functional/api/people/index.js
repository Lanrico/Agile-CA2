import chai from "chai";
import request from "supertest";
const mongoose = require("mongoose");
import Person from "../../../../api/people/peopleModel";
import api from "../../../../index";
import people from "../../../../seedData/people";
import User from "../../../../api/users/userModel";

// set up seed data for datastore
const expect = chai.expect;
let db;
let token;
let page;
let personId;
describe("People endpoint", () => {
  before(() => {
    mongoose.connect(process.env.MONGO_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = mongoose.connection;
  });
  beforeEach(async () => {
    try {
      await Person.deleteMany();
      await Person.collection.insertMany(people);
      await User.deleteMany();
      // Register a user
      await request(api).post("/api/users?action=register").send({
        username: "user1",
        password: "test1",
      });
    } catch (err) {
      console.error(`failed to Load user Data: ${err}`);
    }
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
  describe("GET /api/people", () => {
    describe("when the user is authenticated", () => {
      before(() => {
        token = "BEARER eyJhbGciOiJIUzI1NiJ9.dXNlcjE.FmYria8wq0aFDHnzYWhKQrhF5BkJbFNN1PqNyNQ7V4M"
      })
      it("should return 20 people and a status 200", (done) => {
        request(api)
          .get(`/api/people`)
          .set("Authorization", token)
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err, res) => {
            expect(res.body).to.be.a("array");
            expect(res.body.length).to.equal(20);
            done();
          });
      });
    });
    describe("when the user is not authenticated", () => {
      before(() => {
        token = "123"
      })
      it("should return a status 401", (done) => {
        request(api)
          .get(`api/people`)
          .set("Authorization", token)
          .expect(401)
          .expect("Unauthorized")
          .end((err, res) => {
            done();
          });
        });
    });
  });

  describe("GET /api/people/:id", () => {
    describe("when the user is authenticated", () => {
      before(() => {
        token = "BEARER eyJhbGciOiJIUzI1NiJ9.dXNlcjE.FmYria8wq0aFDHnzYWhKQrhF5BkJbFNN1PqNyNQ7V4M"
      })
      describe("for valid id", () => {
        it("should an object of people and a status 200", (done) => {
          request(api)
            .get(`/api/people/${people[0].id}`)
            .set("Authorization", token)
            .expect("Content-Type", /json/)
            .expect(200)
            .end((err, res) => {
              expect(res.body).to.have.property("name", people[0].name);
              done();
            });
        });
      });
      describe("for invalid id", () => {
        it("should return the NOT found message", () => {
          request(api)
            .get(`/api/people/123123`)
            .set("Authorization", token)
            .expect("Content-Type", /json/)
            .expect(404)
            .expect({ message: 'The resource you requested could not be found.', status_code: 404 })
        });
      });
        describe("when the user is not authenticated", () => {
      before(() => {
        token = "123"
      })
      it("should return a status 401", (done) => {
        request(api)
          .get(`api/people`)
          .set("Authorization", token)
          .expect(401)
          .expect("Unauthorized")
          .end((err, res) => {
            done();
          });
        });
      });
    });
  });

  describe("GET /api/people/tmdb/popular/page:page", () => {
    describe("when the user is authenticated", () => {
      before(() => {
        token = "BEARER eyJhbGciOiJIUzI1NiJ9.dXNlcjE.FmYria8wq0aFDHnzYWhKQrhF5BkJbFNN1PqNyNQ7V4M"
      })
      describe("for a valid page", () => {
        before(() => {
          page = 1
        })
        it("should return 20 people and a status 200", () => {
          return request(api)
            .get(`/api/people/tmdb/popular/page${page}`)
            .set("Authorization", token)
            .expect("Content-Type", /json/)
            .expect(200)
            .then((res) => {
              expect(res.body).to.have.property("page", page);
              expect(res.body.results).to.be.a("array");
              expect(res.body.results.length).to.equal(20);
            });
        });
      });
      describe("for an invalid page", () => {
        before(() => {
          page = 0
        })
        it("should return error message and a status 404", () => {
          return request(api)
            .get(`/api/people/tmdb/popular/page${page}`)
            .set("Authorization", token)
            .expect("Content-Type", /json/)
            .expect(404)
            .expect({
              message: 'Invalid page form.', status_code: 404
            });
        });
      });
      describe("when the user is not authenticated", () => {
        before(() => {
          token = "123", page = 1
        })
        it("should return a status 401 and Unauthorized message", () => {
          return request(api)
            .get(`/api/people/tmdb/popular/page${page}`)
            .set("Authorization", token)
            .expect(401)
            .expect("Unauthorized");
        });
      });
    });
  });

  describe("GET /api/people/tmdb/person/:id", () => {
    describe("when the user is authenticated", () => {
      before(() => {
        token = "BEARER eyJhbGciOiJIUzI1NiJ9.dXNlcjE.FmYria8wq0aFDHnzYWhKQrhF5BkJbFNN1PqNyNQ7V4M"
      })
      describe("for a valid id", () => {
        before(() => {
          personId = 287
        })
        it("should return a object of person from tmdb and a status 200", () => {
          return request(api)
            .get(`/api/people/tmdb/person/${personId}`)
            .set("Authorization", token)
            .expect("Content-Type", /json/)
            .expect(200)
            .then((res) => {
              expect(res.body).to.have.property("id", personId);
            });
        });
      });
      describe("for an invalid id", () => {
        before(() => {
          personId = "qwe"
        })
        it("should return error message and a status 404", () => {
          return request(api)
            .get(`/api/people/tmdb/person/${personId}`)
            .set("Authorization", token)
            .expect("Content-Type", /json/)
            .expect(403)
            .expect({
              message: 'Invalid person id.', status_code: 403
            });
        });
      });
      describe("when the user is not authenticated", () => {
        before(() => {
          token = "123", page = 1
        })
        it("should return a status 401 and Unauthorized message", () => {
          return request(api)
            .get(`/api/people/tmdb/person/${personId}`)
            .set("Authorization", token)
            .expect(401)
            .expect("Unauthorized");
        });
      });
    });
  });

  describe("GET /api/people/tmdb/person/:id/images", () => {
    describe("when the user is authenticated", () => {
      before(() => {
        token = "BEARER eyJhbGciOiJIUzI1NiJ9.dXNlcjE.FmYria8wq0aFDHnzYWhKQrhF5BkJbFNN1PqNyNQ7V4M"
      })
      describe("for a valid id", () => {
        before(() => {
          personId = 287
        })
        it("should return a person's images from tmdb and a status 200", () => {
          return request(api)
            .get(`/api/people/tmdb/person/${personId}/images`)
            .set("Authorization", token)
            .expect("Content-Type", /json/)
            .expect(200)
            .then((res) => {
              expect(res.body).to.have.property("id", personId);
              expect(res.body).to.have.property("profiles");
            });
        });
      });
      describe("for an invalid id", () => {
        before(() => {
          personId = "qwe"
        })
        it("should return error message and a status 404", () => {
          return request(api)
            .get(`/api/people/tmdb/person/${personId}/images`)
            .set("Authorization", token)
            .expect("Content-Type", /json/)
            .expect(403)
            .expect({
              message: 'Invalid person id.', status_code: 403
            });
        });
      });
      describe("when the user is not authenticated", () => {
        before(() => {
          token = "123", page = 1
        })
        it("should return a status 401 and Unauthorized message", () => {
          return request(api)
            .get(`/api/people/tmdb/person/${personId}/images`)
            .set("Authorization", token)
            .expect(401)
            .expect("Unauthorized");
        });
      });
    });
  });

  describe("GET /api/people/tmdb/person/:id/movie_credits", () => {
    describe("when the user is authenticated", () => {
      before(() => {
        token = "BEARER eyJhbGciOiJIUzI1NiJ9.dXNlcjE.FmYria8wq0aFDHnzYWhKQrhF5BkJbFNN1PqNyNQ7V4M"
      })
      describe("for a valid id", () => {
        before(() => {
          personId = 287
        })
        it("should return a person's movie credits from tmdb and a status 200", () => {
          return request(api)
            .get(`/api/people/tmdb/person/${personId}/movie_credits`)
            .set("Authorization", token)
            .expect("Content-Type", /json/)
            .expect(200)
            .then((res) => {
              expect(res.body).to.have.property("cast");
              expect(res.body.cast).to.be.a("array");
            });
        });
      });
      describe("for an invalid id", () => {
        before(() => {
          personId = "qwe"
        })
        it("should return error message and a status 404", () => {
          return request(api)
            .get(`/api/people/tmdb/person/${personId}/movie_credits`)
            .set("Authorization", token)
            .expect("Content-Type", /json/)
            .expect(403)
            .expect({
              message: 'Invalid person id.', status_code: 403
            });
        });
      });
      describe("when the user is not authenticated", () => {
        before(() => {
          token = "123", page = 1
        })
        it("should return a status 401 and Unauthorized message", () => {
          return request(api)
            .get(`/api/people/tmdb/person/${personId}/images`)
            .set("Authorization", token)
            .expect(401)
            .expect("Unauthorized");
        });
      });
    });
  });

  describe("GET /api/people/tmdb/person/:id/external_ids", () => {
    describe("when the user is authenticated", () => {
      before(() => {
        token = "BEARER eyJhbGciOiJIUzI1NiJ9.dXNlcjE.FmYria8wq0aFDHnzYWhKQrhF5BkJbFNN1PqNyNQ7V4M"
      })
      describe("for a valid id", () => {
        before(() => {
          personId = 287
        })
        it("should return a person's external ids from tmdb and a status 200", () => {
          return request(api)
            .get(`/api/people/tmdb/person/${personId}/external_ids`)
            .set("Authorization", token)
            .expect("Content-Type", /json/)
            .expect(200)
            .then((res) => {
              expect(res.body).to.have.property("id", personId);
              expect(res.body).to.have.property("facebook_id");
            });
        });
      });
      describe("for an invalid id", () => {
        before(() => {
          personId = "qwe"
        })
        it("should return error message and a status 404", () => {
          return request(api)
            .get(`/api/people/tmdb/person/${personId}/external_ids`)
            .set("Authorization", token)
            .expect("Content-Type", /json/)
            .expect(403)
            .expect({
              message: 'Invalid person id.', status_code: 403
            });
        });
      });
      describe("when the user is not authenticated", () => {
        before(() => {
          token = "123", page = 1
        })
        it("should return a status 401 and Unauthorized message", () => {
          return request(api)
            .get(`/api/people/tmdb/person/${personId}/images`)
            .set("Authorization", token)
            .expect(401)
            .expect("Unauthorized");
        });
      });
    });
  });
});      