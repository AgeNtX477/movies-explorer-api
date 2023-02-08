const Movie = require('../models/movie');
const BadRequestErr = require('../errors/BadRequestErr');
const NotFoundErr = require('../errors/NotFoundErr');
const ForbiddenErr = require('../errors/ForbiddenErr');
const ConflictErr = require('../errors/ConflictErr');

module.exports.getMovies = (req, res, next) => {
  const owner = req.user._id;
  Movie.find({ owner })
    .then((movie) => {
      if (!movie) {
        throw new NotFoundErr('Фильмы не найдены');
      }
      return res.status(200).send(movie);
    })
    .catch(next);
};

module.exports.postMovie = (req, res, next) => {
  const {
    country, director, duration, year, description, image,
    trailerLink, nameRU, nameEN, thumbnail, movieId,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: req.user._id,
  })
    .then((newMovie) => res.send(newMovie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestErr('Переданы некорректные данные при создании фильма');
      } else if (err.code === 11000) {
        throw new ConflictErr('Запрос не может быть выполнен из-за конфликтного обращения к ресурсу');
      }
    })
    .catch(next);
};

module.exports.deleteMovie = (req, res, next) => {
  const owner = req.user._id;
  Movie.findById(req.params.movieId)
    .then((movie) => {
      if (!movie) {
        throw new NotFoundErr('Фильм не найден');
      }
      if (movie.owner.toString() !== owner) {
        throw new ForbiddenErr('Вы можете удалять только свои фильмы');
      } else {
        return movie.remove().then(() => res.status(200).send(movie));
      }
    })
    .catch(next);
};
