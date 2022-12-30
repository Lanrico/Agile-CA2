import express from 'express';
import asyncHandler from 'express-async-handler';
import { getTrendingList } from '../tmdb-api';

const router = express.Router();

router.get('/tmdb/:type/:time_window', asyncHandler(async (req, res) => {
    const type = req.params.type;
    const time_window = req.params.time_window;
    if ((type === "person" || type === "movie") && (time_window === "day" || time_window === "week")) {
        const trendingList = await getTrendingList(type, time_window);
        res.status(200).json(trendingList);
    }
    else {
        res.status(404).json({ message: 'Invalid trending type or time_window.', status_code: 404 });
    }
}));

export default router;