import { getUpcomingMovies, getMovie, getMovieImages, getMovieReviews } from "../../tmdb-api";
import asyncHandler from 'express-async-handler';

import express from 'express';
const router = express.Router();
router.get('/upcoming/page:page', asyncHandler(async (req, res) => {
    const page = parseInt(req.params.page);
    const upcomingMovies = await getUpcomingMovies(page);
    res.status(200).json(upcomingMovies);
}));
router.get('/movie/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const movie = await getMovie(id);
    res.status(200).json(movie);
}));

router.get('/movie/:id/images', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const movieImages = await getMovieImages(id);
    res.status(200).json(movieImages);
}));

router.get('/movie/:id/reviews', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const movieReviews = await getMovieReviews(id);
    res.status(200).json(movieReviews);
}));
export default router;