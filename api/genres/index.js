import express from 'express';
import { genres } from './genresData';
import Genre from './genreModel';
import uniqid from 'uniqid'
import { getGenres } from '../tmdb-api';

const router = express.Router(); 

router.get('/', async (req, res) => {
    const genres = await Genre.find();
    res.status(200).json(genres);
});

router.get('/tmdb', async (req, res) => {
    const genres = await getGenres();
    res.status(200).json(genres);
});
export default router;