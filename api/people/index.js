import express from 'express';
import asyncHandler from 'express-async-handler';
import { getPeople, getPerson, getPersonImages, getPersonMovieCredits, getPersonExternalIds } from '../tmdb-api';
import peopleModel from './peopleModel';

const router = express.Router();
const personIdReg = /^[0-9]+.?[0-9]*$/;

router.get('/', asyncHandler(async (req, res) => {
    const people = await peopleModel.find();
    res.status(200).json(people);
}));

// Get person details
router.get('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const person = await peopleModel.findByPeopleDBId(id);
    if (!personIdReg.test(id)) {
        res.status(403).json({ message: 'Invalid person id.', status_code: 403 });
    }
    if (person) {
        res.status(200).json(person);
    } else {
        res.status(404).json({ message: 'The resource you requested could not be found.', status_code: 404 });
    }
}));

router.get('/tmdb/popular/page:page', asyncHandler(async (req, res) => {
    const page = parseInt(req.params.page);
    console.log(page)
    const people = await getPeople(page);
    res.status(200).json(people);
}));

router.get('/tmdb/person/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const person = await getPerson(id);
    res.status(200).json(person);
}));

router.get('/tmdb/person/:id/images', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const personImages = await getPersonImages(id);
    res.status(200).json(personImages);
}));

router.get('/tmdb/person/:id/movie_credits', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const personMovieCredits = await getPersonMovieCredits(id);
    res.status(200).json(personMovieCredits);
}));

router.get('/tmdb/person/:id/external_ids', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const personExternalIds = await getPersonExternalIds(id);
    res.status(200).json(personExternalIds);
}));

export default router;