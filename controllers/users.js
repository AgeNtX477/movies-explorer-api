const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundErr = require('../errors/NotFoundErr');
const BadRequestErr = require('../errors/BadRequestErr');
const UnAuthErr = require('../errors/UnAuthErr');
const ConflictErr = require('../errors/ConflictErr');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production'
        ? JWT_SECRET
        : 'dev-secret', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch(() => next(new UnAuthErr('Некорректный email или пароль.')));
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundErr('Пользователь по указанному _id не найден.');
      }
      return res.status(200).send(user);
    })
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundErr('Пользователь с указанным _id не найден.');
      }
      return res.status(200).send(data);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestErr('Переданы некорректные данные при обновлении профиля.'));
      }
      return next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;

  return bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => {
      res.status(201).send({
        name: user.name,
        email: user.email,
        _id: user._id,
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        return next(new ConflictErr('Пользователь с данным email уже зарегистрирован.'));
      }
      if (err.name === 'ValidationError') {
        return next(new BadRequestErr('Переданы некорректные данные при создании пользователя.'));
      }
      return next(err);
    });
};
