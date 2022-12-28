import express from 'express';
import User from './userModel';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import movieModel from '../movies/movieModel';
import movies from '../../seedData/movies'

const router = express.Router(); // eslint-disable-line
const passwordReg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/;
const userNameReg = /^[(a-zA-Z0-9\u4e00-\u9fa5){1}_#]{4,20}$/;
const favouriteReg = /^[0-9]+.?[0-9]*$/;

// Get all users
router.get('/', async (req, res) => {
    const users = await User.find();
    res.status(200).json(users);
});

// Register OR authenticate a user
router.post('/', asyncHandler(async (req, res, next) => {
    if (!req.body.username || !req.body.password) {
        res.status(401).json({ success: false, msg: 'Please pass username and password.' });
        return next();
    }
    if (req.query.action === 'register') {
        const user = await User.findByUserName(req.body.username);
        if (!user) {
            if (!passwordReg.test(req.body.password)) {
                res.status(401).json({ success: false, msg: 'The password should at least 5 characters long and contain at least one number and one letter.' });
            }
            if(!userNameReg.test(req.body.password)) {
                res.status(401).json({ success: false, msg: 'Username can only consist of letters, numbers and underscores.' });
            }
            await User.create(req.body);
            res.status(201).json({ code: 201, msg: 'Successful created new user.' });
        }
        res.status(402).json({ success: false, msg: 'User name already exist' });
    } else {
        const user = await User.findByUserName(req.body.username);
        if (!user) return res.status(401).json({ code: 401, msg: 'Authentication failed. User not found.' });
        user.comparePassword(req.body.password, (err, isMatch) => {
            if (isMatch && !err) {
                // if user is found and password matches, create a token
                const token = jwt.sign(user.username, process.env.SECRET);
                // return the information including token as JSON
                res.status(200).json({ success: true, token: 'BEARER ' + token });
            } else {
                res.status(401).json({ code: 401, msg: 'Authentication failed. Wrong password.' });
            }
        });
    }
}));

// Update a user
router.put('/:id', async (req, res) => {
    if (req.body._id) delete req.body._id;
    const result = await User.updateOne({
        _id: req.params.id,
    }, req.body);
    if (result.matchedCount) {
        res.status(200).json({ code: 200, msg: 'User Updated Sucessfully' });
    } else {
        res.status(404).json({ code: 404, msg: 'Unable to Update User' });
    }
});

//Add a favourite.
router.post('/:userName/favourites', asyncHandler(async (req, res) => {
    const newFavourite = req.body.id;
    const userName = req.params.userName;
    // const movie = await movieModel.findByMovieDBId(newFavourite);
    const user = await User.findByUserName(userName);
    if (!user.favourites.includes(newFavourite)) {
        await user.favourites.push(newFavourite);
        await user.save();
        res.status(201).json(user);
    }
    else {
        res.status(404).json({ code: 404, msg: 'Already in favourites' });
    }
}));

router.get('/:userName/favourites', asyncHandler(async (req, res) => {
    const userName = req.params.userName;
    const user = await User.findByUserName(userName).populate('favourites');
    res.status(200).json(user.favourites);
}));

router.post('/:userName/favourites/remove', asyncHandler(async (req, res) => {
    const oldFavourite = req.body.id;
    const userName = req.params.userName;
    const user = await User.findByUserName(userName);
    if (!favouriteReg.test(oldFavourite) || !userNameReg.test(userName)) {
        res.status(403).json({ code: 403, msg: 'Invalid movie id or user name' });
    }
    if (user.favourites.includes(oldFavourite)) {
        await user.favourites.pop(oldFavourite);
        await user.save();
        res.status(201).json(user);
    }
    else {
        res.status(404).json({ code: 404, msg: 'Not in favourites' });
    }
}));

router.get('/:userName/recommendation', asyncHandler(async (req, res) => {
    const userName = req.params.userName;
    const user = await User.findByUserName(userName).populate('favourites');
    var favouriteMovieGenre = {};
    if(user.favourites.length == 0) {
        res.status(404).json({ code: 404, msg: 'You do not have any favourite movie.' });
    }
    //Count the number of occurrences of each genre
    for (let index = 0; index < user.favourites.length; index++) {
        const element = user.favourites[index];
        var j = await movieModel.findByMovieDBId(element)
        j.genre_ids.map((g) => {
            if (favouriteMovieGenre[g]) {
                favouriteMovieGenre[g] += 1
            }
            else {
                favouriteMovieGenre[g] = 1
            }
        })
    }

    //Find the genre with the most occurrences
    var keys   = Object.keys(favouriteMovieGenre);
    var max = Math.max.apply(null, keys.map(function(x) { return favouriteMovieGenre[x]} ));
    var mostGenre  = keys.filter(function(y) { return favouriteMovieGenre[y] === max });

    //Find the movies contains the genres
    var results = movies.filter((m) => m.genre_ids.indexOf(parseInt(mostGenre)) > -1)
    console.log(results.length)
    res.status(200).json(results);
}));
export default router;