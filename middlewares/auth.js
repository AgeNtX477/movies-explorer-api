// мидл вар для защиты страниц на которые пользователь
// не имеет доступа если он не залогинин
const jwt = require('jsonwebtoken');
const UnAuthErr = require('../errors/UnAuthErr');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnAuthErr('Ошибка авторизации.');
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    next(new UnAuthErr('Необходима авторизация.'));
  }

  req.user = payload;

  next();
};
