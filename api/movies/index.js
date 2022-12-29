import express from 'express';
import { movies, movieReviews, movieDetails } from './moviesData';
import uniqid from 'uniqid'
import movieModel from './movieModel';
import asyncHandler from 'express-async-handler';
import { getUpcomingMovies, getMovies, getMovie, getMovieImages, getMovieReviews } from '../tmdb-api';

const router = express.Router();
const movieIdReg = /^[0-9]+.?[0-9]*$/;
const pageReg = /^[1-9]+.?[1-9]*$/;

router.get('/', asyncHandler(async (req, res) => {
    const movies = await movieModel.find();
    res.status(200).json(movies);
}));

// Get movie details
router.get('/:id', asyncHandler(async (req, res) => {
    if (!movieIdReg.test(req.params.id)) {
        res.status(403).json({ message: 'Invalid movie id.', status_code: 403 });
    }
    else {
        const id = parseInt(req.params.id);
        const movie = await movieModel.findByMovieDBId(id);

        if (movie) {
            res.status(200).json(movie);
        } else {
            res.status(404).json({ message: 'The resource you requested could not be found.', status_code: 404 });
        }
    }
}));

// Get movie reviews
router.get('/:id/reviews', (req, res) => {
    const id = parseInt(req.params.id);
    // find reviews in list
    if (!movieIdReg.test(id)) {
        res.status(403).json({ message: 'Invalid movie id.', status_code: 403 });
    }
    else if (movieReviews.id == id) {
        res.status(200).json(movieReviews);
    } else {
        res.status(404).json({
            message: 'The resource you requested could not be found.',
            status_code: 404
        });
    }
});

//Post a movie review
router.post('/:id/reviews', (req, res) => {
    const id = parseInt(req.params.id);

    if (!movieIdReg.test(id)) {
        res.status(403).json({ message: 'Invalid movie id.', status_code: 403 });
    }
    else if (movieReviews.id == id) {
        if (req.body.author && req.body.content) {
            req.body.created_at = new Date();
            req.body.updated_at = new Date();
            req.body.id = uniqid();
            movieReviews.results.push(req.body); //push the new review onto the list
            res.status(201).json(req.body);
        }
        else {
            res.status(403).json({ message: 'Invalid author name or content.', status_code: 403 });
        }
    } else {
        res.status(404).json({
            message: 'The resource you requested could not be found.',
            status_code: 404
        });
    }
});

router.get('/tmdb/discover/page:page', asyncHandler(async (req, res) => {
    if (pageReg.test(req.params.page)) {
        const page = parseInt(req.params.page);
        const movies = await getMovies(page);
        res.status(200).json(movies);
    }
    else {
        res.status(404).json({ message: 'Invalid page form.', status_code: 404 })
    }
}));
export default router;