import express from 'express';
import asyncHandler from 'express-async-handler';
import {  getTrendingList } from '../tmdb-api';

const router = express.Router();

router.get('/tmdb/:type/:time_window', asyncHandler(async (req, res) => {
    const type = req.params.type;
    const time_window = req.params.time_window;
    const trendingList = await getTrendingList(type, time_window);
    res.status(200).json(trendingList);
}));

export default router;