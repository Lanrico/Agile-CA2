import { getUpcomingMovies, getMovie, getMovieImages, getMovieReviews } from "../../tmdb-api";
import asyncHandler from 'express-async-handler';

import express from 'express';
const router = express.Router();
const pageReg = /^[1-9]+.?[1-9]*$/;
const movieIdReg = /^[0-9]+.?[0-9]*$/;

router.get('/upcoming/page:page', asyncHandler(async (req, res) => {
    if (pageReg.test(req.params.page)) {
        const page = parseInt(req.params.page);
        const upcomingMovies = await getUpcomingMovies(page);
        res.status(200).json(upcomingMovies);
    }
    else {
        res.status(404).json({ message: 'Invalid page form.', status_code: 404 })
    }
}));
router.get('/movie/:id', asyncHandler(async (req, res) => {
    if (!movieIdReg.test(req.params.id)) {
        res.status(403).json({ message: 'Invalid movie id.', status_code: 403 });
    }
    else {
        const id = parseInt(req.params.id);
        const movie = await getMovie(id);
        res.status(200).json(movie);
    }
}));

router.get('/movie/:id/images', asyncHandler(async (req, res) => {
    if (!movieIdReg.test(req.params.id)) {
        res.status(403).json({ message: 'Invalid movie id.', status_code: 403 });
    }
    else {
        const id = parseInt(req.params.id);
        const movieImages = await getMovieImages(id);
        res.status(200).json(movieImages);
    }
}));

router.get('/movie/:id/reviews', asyncHandler(async (req, res) => {
    if (!movieIdReg.test(req.params.id)) {
        res.status(403).json({ message: 'Invalid movie id.', status_code: 403 });
    }
    else {
        const id = parseInt(req.params.id);
        const movieReviews = await getMovieReviews(id);
        res.status(200).json(movieReviews);
    }
}));
export default router;