import chai from "chai";
import request from "supertest";
const mongoose = require("mongoose");
import Movie from "../../../../api/movies/movieModel";
import api from "../../../../index";
import movies from "../../../../seedData/movies";
import User from "../../../../api/users/userModel";
import { movieReviews } from '../../../../api/movies/moviesData'

// set up seed data for datastore
let seedData = {
  movieReviews: []
}
movieReviews.results.forEach(review => seedData.movieReviews.push(review))
const expect = chai.expect;
let db;
let page;
let token;
let date;
let reviewsLength;
let rAuthor;
let rContent;

describe("Movies endpoint", () => {
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
    // Clean out datastore
    while (movieReviews.results.length > 0) {
      movieReviews.results.pop()
    }
    // Repopulate datastore
    seedData.movieReviews.forEach(review => movieReviews.results.push(review))
    try {
      await Movie.deleteMany();
      await Movie.collection.insertMany(movies);
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
  afterEach(() => {
    api.close(); // Release PORT 8080
  });
  describe("GET /api/movies ", () => {
    it("should return 20 movies and a status 200", (done) => {
      request(api)
        .get("/api/movies")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .end((err, res) => {
          expect(res.body).to.be.a("array");
          expect(res.body.length).to.equal(20);
          done();
        });
    });
  });

  describe("GET /api/movies/:id", () => {
    describe("when the id is valid", () => {
      it("should return the matching movie", () => {
        return request(api)
          .get(`/api/movies/${movies[0].id}`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .then((res) => {
            expect(res.body).to.have.property("title", movies[0].title);
          });
      });
    });
    describe("when the id is invalid", () => {
      it("should return the NOT found message", () => {
        return request(api)
          .get("/api/movies/9999")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .expect({
            status_code: 404,
            message: "The resource you requested could not be found.",
          });
      });
    });
  });
  //
  //
  //
  //
  describe("GET /api/movies/:id/reviews", () => {
    describe("when the id is valid", () => {
      it("should a object contains a list of the reviews of the movie and a status 200", () => {
        return request(api)
          .get(`/api/movies/${movieReviews.id}/reviews`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .then((res) => {
            expect(res.body).to.have.property("id", 527774);
            expect(res.body.results).to.be.a("array");
          });
      });
    });
    describe("when movie id is invalid characters like letters", () => {
      it("should return a status 403 and the corresponding message", () => {
        return request(api)
          .get(`/api/movies/qweqwe/reviews`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(403)
          .expect({ message: 'Invalid movie id.', status_code: 403 });
      });
    });
    describe("when movie id is invalid", () => {
      it("should return a status 404 and the corresponding message", () => {
        return request(api)
          .get(`/api/movies/999/reviews`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .expect({
            message: 'The resource you requested could not be found.',
            status_code: 404
          });
      });
    });
  });

  describe("POST /api/movies/:id/reviews", () => {
    describe("when the id is valid", () => {
      describe("for both the author and content are not empty", () => {
        before(() => {
          rAuthor = "Miku",
            rContent = "I love you."
        })
        it("should a object contains a list of the reviews of the movie and a status 200", () => {
          return request(api)
            .post(`/api/movies/${movieReviews.id}/reviews`)
            .send({
              author: rAuthor,
              content: rContent
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(201)
            .then((res) => {
              expect(res.body).to.have.property("author", rAuthor)
              expect(res.body).to.have.property("content", rContent)
            });
        });
      });
      describe("for both author and content are empty", () => {
        it("should return a status 403 and the corresponding message", () => {
          return request(api)
            .post(`/api/movies/${movieReviews.id}/reviews`)
            .send({
              author: "",
              content: ""
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(403)
            .expect({ message: 'Invalid author name or content.', status_code: 403 });
        })
      })
      describe("for author is empty and content is not empty", () => {
        it("should return a status 403 and the corresponding message", () => {
          return request(api)
            .post(`/api/movies/${movieReviews.id}/reviews`)
            .send({
              author: "",
              content: "123123"
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(403)
            .expect({ message: 'Invalid author name or content.', status_code: 403 });
        })
      })
      describe("for author is not empty and content is empty", () => {
        it("should return a status 403 and the corresponding message", () => {
          return request(api)
            .post(`/api/movies/${movieReviews.id}/reviews`)
            .send({
              author: "123123",
              content: ""
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(403)
            .expect({ message: 'Invalid author name or content.', status_code: 403 });
        })
      })
      describe("for do not have author and content", () => {
        it("should return a status 403 and the corresponding message", () => {
          return request(api)
            .post(`/api/movies/${movieReviews.id}/reviews`)
            .send({
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(403)
            .expect({ message: 'Invalid author name or content.', status_code: 403 });
        })
      })
      describe("for do not have author and have a valid content", () => {
        it("should return a status 403 and the corresponding message", () => {
          return request(api)
            .post(`/api/movies/${movieReviews.id}/reviews`)
            .send({
              content: "123123123"
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(403)
            .expect({ message: 'Invalid author name or content.', status_code: 403 });
        })
      })
      describe("for do not have content and have a valid author", () => {
        it("should return a status 403 and the corresponding message", () => {
          return request(api)
            .post(`/api/movies/${movieReviews.id}/reviews`)
            .send({
              author: "123123123"
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(403)
            .expect({ message: 'Invalid author name or content.', status_code: 403 });
        })
      })
    });
    describe("when movie id is invalid characters like letters", () => {
      it("should return a status 403 and the corresponding message", () => {
        return request(api)
          .post(`/api/movies/qweqwe/reviews`)
          .send({
            author: "Miku",
            content: "I love you."
          })
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(403)
          .expect({ message: 'Invalid movie id.', status_code: 403 });
      });
    });
    describe("when movie id is invalid", () => {
      it("should return a status 404 and the corresponding message", () => {
        return request(api)
          .post(`/api/movies/999/reviews`)
          .send({
            author: "Miku",
            content: "I love you."
          })
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .expect({
            message: 'The resource you requested could not be found.',
            status_code: 404
          });
      });
    });
  });

  describe("GET /api/movies/tmdb/discover/page:page", () => {
    describe("when the page is valid number", () => {
      before(() => {
        page = 1
      })
      it("should return 20 movies of corresponding page from tmdb and a status 200", () => {
        return request(api)
          .get(`/api/movies/tmdb/discover/page${page}`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .then((res) => {
            expect(res.body).to.have.property("page", page);
            expect(res.body.results).to.be.a("array");
            expect(res.body.results.length).to.equal(20);
          });
      });
    });
    describe("when the page is an invalid character", () => {
      before(() => {
        page = 0
      })
      it("should return a status 404 and the corresponding message", () => {
        return request(api)
          .get(`/api/movies/tmdb/discover/page${page}`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .expect({
            message: 'Invalid page form.', status_code: 404
          });
      });
    });
  });

  describe("GET /api/movies/tmdb/upcoming/page:page", () => {
    describe("when the user is authenticated", () => {
      before(() => {
        token = "BEARER eyJhbGciOiJIUzI1NiJ9.dXNlcjE.FmYria8wq0aFDHnzYWhKQrhF5BkJbFNN1PqNyNQ7V4M"
      })
      describe("when the page is valid number", () => {
        before(() => {
          page = 1
        })
        it("should return 20 movies of corresponding page from tmdb and a status 200", () => {
          return request(api)
            .get(`/api/movies/tmdb/upcoming/page${page}`)
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
      describe("when the page is an invalid character", () => {
        before(() => {
          page = 0
        })
        it("should return a status 404 and the corresponding message", () => {
          return request(api)
            .get(`/api/movies/tmdb/upcoming/page${page}`)
            .set("Authorization", token)
            .expect("Content-Type", /json/)
            .expect(404)
            .expect({ message: 'Invalid page form.', status_code: 404 });
        });
      });
    });
    describe("when the user is not authenticated", () => {
      before(() => {
        token = "123", page = 1
      })
      it("should return a status 401 and Unauthorized message", () => {
        return request(api)
          .get(`/api/movies/tmdb/upcoming/page${page}`)
          .set("Authorization", token)
          .expect(401)
          .expect("Unauthorized");
      });
    });
  });

  describe("GET /api/movies/tmdb/movie/:id", () => {
    describe("when the user is authenticated", () => {
      before(() => {
        token = "BEARER eyJhbGciOiJIUzI1NiJ9.dXNlcjE.FmYria8wq0aFDHnzYWhKQrhF5BkJbFNN1PqNyNQ7V4M"
      })
      describe("when the id is valid number", () => {
        it("should return an object of the movie's details in tmdb and status 200", () => {
          return request(api)
            .get(`/api/movies/tmdb/movie/${movies[0].id}`)
            .set("Authorization", token)
            .expect("Content-Type", /json/)
            .expect(200)
            .then((res) => {
              expect(res.body).to.have.property("id", movies[0].id);
              expect(res.body).to.have.property("title", movies[0].title);
            });
        });
      });
      describe("when the id is not number", () => {
        it("should return a status 403 and the corresponding message", () => {
          return request(api)
            .get(`/api/movies/tmdb/movie/qwe`)
            .set("Authorization", token)
            .expect("Content-Type", /json/)
            .expect(403)
            .expect({ message: 'Invalid movie id.', status_code: 403 });
        });
      });
    });
    describe("when the user is not authenticated", () => {
      before(() => {
        token = "123"
      })
      it("should return a status 401 and Unauthorized message", () => {
        return request(api)
          .get(`/api/movies/tmdb/movie/${movies[0].id}`)
          .set("Authorization", token)
          .expect(401)
          .expect("Unauthorized");
      });
    });
  });

  describe("GET /api/movies/tmdb/movie/:id/images", () => {
    describe("when the user is authenticated", () => {
      before(() => {
        token = "BEARER eyJhbGciOiJIUzI1NiJ9.dXNlcjE.FmYria8wq0aFDHnzYWhKQrhF5BkJbFNN1PqNyNQ7V4M"
      })
      describe("when the id is valid number", () => {
        it("should return an object containing the images and status 200", () => {
          return request(api)
            .get(`/api/movies/tmdb/movie/${movies[0].id}/images`)
            .set("Authorization", token)
            .expect("Content-Type", /json/)
            .expect(200)
            .then((res) => {
              expect(res.body).to.have.property("id", movies[0].id);
              expect(res.body).to.have.property("backdrops");
              expect(res.body).to.have.property("posters");
            });
        });
      });
      describe("when the id is not number", () => {
        it("should return a status 403 and the corresponding message", () => {
          return request(api)
            .get(`/api/movies/tmdb/movie/qwe/images`)
            .set("Authorization", token)
            .expect("Content-Type", /json/)
            .expect(403)
            .expect({ message: 'Invalid movie id.', status_code: 403 });
        });
      });
    });
    describe("when the user is not authenticated", () => {
      before(() => {
        token = "123"
      })
      it("should return a status 401 and Unauthorized message", () => {
        return request(api)
          .get(`/api/movies/tmdb/movie/${movies[0].id}/images`)
          .set("Authorization", token)
          .expect(401)
          .expect("Unauthorized");
      });
    });
  });

  describe("GET /api/movies/tmdb/movie/:id/reviews", () => {
    describe("when the user is authenticated", () => {
      before(() => {
        token = "BEARER eyJhbGciOiJIUzI1NiJ9.dXNlcjE.FmYria8wq0aFDHnzYWhKQrhF5BkJbFNN1PqNyNQ7V4M"
      })
      describe("when the id is valid number", () => {
        it("should return a list of the reviews in tmdb and status 200", () => {
          return request(api)
            .get(`/api/movies/tmdb/movie/${movies[0].id}/reviews`)
            .set("Authorization", token)
            .expect("Content-Type", /json/)
            .expect(200)
            .then((res) => {
              expect(res.body).to.have.property("id", movies[0].id);
              expect(res.body.results).to.be.a("array");
            });
        });
      });
      describe("when the id is not number", () => {
        it("should return a status 403 and the corresponding message", () => {
          return request(api)
            .get(`/api/movies/tmdb/movie/qwe/reviews`)
            .set("Authorization", token)
            .expect("Content-Type", /json/)
            .expect(403)
            .expect({ message: 'Invalid movie id.', status_code: 403 });
        });
      });
    });
    describe("when the user is not authenticated", () => {
      before(() => {
        token = "123"
      })
      it("should return a status 401 and Unauthorized message", () => {
        return request(api)
          .get(`/api/movies/tmdb/movie/${movies[0].id}/reviews`)
          .set("Authorization", token)
          .expect(401)
          .expect("Unauthorized");
      });
    });
  });
});