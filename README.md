# Assignment 2 - Agile Software Practice.
​
Name: Guanlan Ji
Student Number: 20099881
​
## API endpoints.

+ GET api/genres - get all movie genres from seedData
+ GET api/genres/tmdb - get all movie genres from TMDB Genres
+ GET api/trending/tmdb/:type/:time_window - get specific type of trending media from TMDB Trending at the specific time window
+ GET api/trending/tmdb/:type/:time_window - get specific type of trending media from TMDB Trending at the specific time window
​+ GET api/users - get all user data from seedData
+ POST api/users - post the username and password to login
+ POST api/users?action=register - post the username and password to register a new user
+ GET api/users/:userName/favourites - get the named user's favourites list
+ POST api/users/:userName/favourites - add a movie to the named user's favourites list.
+ POST api/users/:userName/favourites/remove - remove a movie of a specific id to the named user's favourites list.
+ GET api/users/:userName/recommendation - generate a list of recommend movies from the named user's current favourites.
+ GET api/people (Auth) - get all people from seedData
+ GET api/people/:id (Auth) - get the details of a specific person.
+ GET api/tmdb/popular/page:page (Auth) - get popular people from TMDB Popular at page n
+ GET api/tmdb/person/:id (Auth) - get the details of a specific person from TMDB People.
+ GET api/people/tmdb/person/:id (Auth) - get the details of a specific person from TMDB People.
+ GET api/people/tmdb/person/:id/images (Auth) - get the images of a specific person from TMDB People.
+ GET api/people/tmdb/person/:id/movie_credits (Auth) - get the movie credits of a specific person from TMDB People.
+ GET api/people/tmdb/person/:id/external_ids (Auth) - get the external ids of a specific person from TMDB People.
+ GET api/movies - get all movies from seedData
+ GET api/movies/:id - get the details of a specific movie.
+ GET api/movies/:id/reviews - get the reviews of a specific movie.
+ POST api/movies/:id/reviews - add a new reviews of a specific movie.
+ GET api/movies/tmdb/discover/page:page - get movies from TMDB Discover at page n.  
+ GET api/movies/tmdb/upcoming/page:page (Auth) - get movies from TMDB Upcoming at page n.  
+ GET api/movies/tmdb/movie/:id (Auth) - get details of a specific movie from TMDB Movies.
+ GET api/movies/tmdb/movie/:id/images (Auth) - get the images of a specific movie from TMDB Movies.
+ GET api/movies/tmdb/movie/:id/reviews (Auth) - get the reviews of a specific movie from TMDB Movies.


## Test cases.

~~~
  Users endpoint
    POST /api/users/:userName/favourites
      for valid user name
        when the movie is not in favourites
database connected to test on ac-adm76o4-shard-00-02.gy7xr1q.mongodb.net
          √ should return user message and a status 201 (78ms)
        when the movie is in favourites
          √ return error message and a status 404
    GET /api/users/:userName/favourites
      √ should return the favourites list and status 200
    POST /api/users/:userName/favourites/remove
      for valid user name
        when the movie is in favourites
          √ should return user message and a status 201 (56ms)
        when the movie is not in favourites
          √ return error message and a status 404
    GET /api/users/:userName/recommendation
      when the user have favourites
        √ should return a list of recommand movies and a status 200 (207ms)
      when the user do not have any favourites
        √ return an empty array and a status 201

  Movies endpoint
    GET /api/movies/:id/reviews
      when the id is valid
        √ should a object contains a list of the reviews of the movie and a status 200
      when movie id is invalid characters like letters
        √ should return a status 403 and the corresponding message
      when movie id is invalid
        √ should return a status 404 and the corresponding message
    POST /api/movies/:id/reviews
      when the id is valid
        for both the author and content are not empty
          √ should a object contains a list of the reviews of the movie and a status 200
        for both author and content are empty
          √ should return a status 403 and the corresponding message
        for author is empty and content is not empty
          √ should return a status 403 and the corresponding message
        for author is not empty and content is empty
          √ should return a status 403 and the corresponding message
        for do not have author and content
          √ should return a status 403 and the corresponding message
        for do not have author and have a valid content
          √ should return a status 403 and the corresponding message
        for do not have content and have a valid author
          √ should return a status 403 and the corresponding message
      when movie id is invalid characters like letters
        √ should return a status 403 and the corresponding message
      when movie id is invalid
        √ should return a status 404 and the corresponding message
    GET /api/movies/tmdb/discover/page:page
      when the page is valid number
        √ should return 20 movies of corresponding page from tmdb and a status 200 (84ms)
      when the page is an invalid character
        √ should return a status 404 and the corresponding message
    GET /api/movies/tmdb/upcoming/page:page
      when the user is authenticated
        when the page is valid number
          √ should return 20 movies of corresponding page from tmdb and a status 200 (194ms)
        when the page is an invalid character
          √ should return a status 404 and the corresponding message
      when the user is not authenticated
        √ should return a status 401 and Unauthorized message
    GET /api/movies/tmdb/movie/:id
      when the user is authenticated
        when the id is valid number
          √ should return an object of the movie's details in tmdb and status 200 (103ms)
        when the id is not number
          √ should return a status 403 and the corresponding message
      when the user is not authenticated
        √ should return a status 401 and Unauthorized message
    GET /api/movies/tmdb/movie/:id/images
      when the user is authenticated
        when the id is valid number
          √ should return an object containing the images and status 200 (109ms)
        when the id is not number
          √ should return a status 403 and the corresponding message
      when the user is not authenticated
        √ should return a status 401 and Unauthorized message
    GET /api/movies/tmdb/movie/:id/reviews
      when the user is authenticated
        when the id is valid number
          √ should return a list of the reviews in tmdb and status 200 (113ms)
        when the id is not number
          √ should return a status 403 and the corresponding message
      when the user is not authenticated
        √ should return a status 401 and Unauthorized message

  Genres endpoint
    GET /api/genres
      √ should return 4 genres and a status 200
    GET /api/genres/tmdb
      √ should return a list of genres and a status 200 (77ms)

  Trending endpoint
    GET /api/trending/tmdb/:type/:time_window
      for valid type and valid time window
        when type is movie and time window is day
          √ should a list of 20 trending movies and a status 200 (81ms)
        when type is movie and time window is week
          √ should a list of 20 trending movies and a status 200 (80ms)
        when type is person and time window is day
          √ should a list of 20 trending people and a status 200 (91ms)
        when type is person and time window is week
          √ should a list of 20 trending people and a status 200 (82ms)
      for invalid type and valid time window
        √ should return a status 404 and the corresponding message
      for valid type and invalid time window
        √ should return a status 404 and the corresponding message
      for invalid type and invalid time window
        √ should return a status 404 and the corresponding message

  People endpoint
    GET /api/people
      when the user is authenticated
        √ should return 20 people and a status 200 (85ms)
      when the user is not authenticated
        √ should return a status 401
    GET /api/people/:id
      when the user is authenticated
        for valid id
          √ should an object of people and a status 200 (44ms)
        for invalid id
          √ should return the NOT found message (50ms)
        when the user is not authenticated
          √ should return a status 401
    GET /api/people/tmdb/popular/page:page
      when the user is authenticated
        for a valid page
          √ should return 20 people and a status 200 (95ms)
        for an invalid page
          √ should return error message and a status 404
        when the user is not authenticated
          √ should return a status 401 and Unauthorized message
    GET /api/people/tmdb/person/:id
      when the user is authenticated
        for a valid id
          √ should return a object of person from tmdb and a status 200 (104ms)
        for an invalid id
          √ should return error message and a status 404
        when the user is not authenticated
          √ should return a status 401 and Unauthorized message
    GET /api/people/tmdb/person/:id/images
      when the user is authenticated
        for a valid id
          √ should return a person's images from tmdb and a status 200 (102ms)
        for an invalid id
          √ should return error message and a status 404
        when the user is not authenticated
          √ should return a status 401 and Unauthorized message
    GET /api/people/tmdb/person/:id/movie_credits
      when the user is authenticated
        for a valid id
          √ should return a person's movie credits from tmdb and a status 200 (124ms)
        for an invalid id
          √ should return error message and a status 404
        when the user is not authenticated
          √ should return a status 401 and Unauthorized message
    GET /api/people/tmdb/person/:id/external_ids
      when the user is authenticated
        for a valid id
          √ should return a person's external ids from tmdb and a status 200 (108ms)
        for an invalid id
          √ should return error message and a status 404
        when the user is not authenticated
          √ should return a status 401 and Unauthorized message


  62 passing (22s)
~~~
​
## Independent Learning (if relevant)
​
State the options from the Excellent grade band you attempted. 
​
For Option A, specify the URL of the GitHub repository hosting the source code for the single-endpoint project and the URL of the Vercel deployment. If the deployment failed, explain the problem(s) you encountered.
​
For Option B, specify the URL of the Coveralls webpage that contains your tests' code coverage metrics.
​
State any other independent learning you achieved while completing this assignment.
Option B:
https://coveralls.io/gitlab/Lanrico/agile-ca2-cicd?branch=main
[![Coverage Status](https://coveralls.io/repos/gitlab/Lanrico/agile-ca2-cicd/badge.svg?branch=main)](https://coveralls.io/gitlab/Lanrico/agile-ca2-cicd?branch=main)