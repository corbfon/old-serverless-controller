const mongooseValidation = (err, req, res, next) => {
  console.log('running errors')
  if (err.name === 'ValidationError') {
    return res.status(400).send(err)
  } else {
    next(err)
  }
}

const queryValidation = (err, req, res, next) => {
  if (err.name === 'InvalidQueryError') {
    return res.status(400).send({ name: err.name, message: err.message })
  } else {
    next(err)
  }
}

const handleElastic = (err, req, res, next) => {
  if (err.source === 'elastic') {
    return res.status(err.statusCode).send(err)
  } else {
    return next(err)
  }
}

const handleEvents = (err, req, res, next) => {
  if (err.source === 'event-validation') {
    return res.status(400).send({ error: err.name, message: err.message })
  } else {
    next(err)
  }
}

const defaultError = (err, req, res, next) => {
  console.error(Object.keys(err))
  const body = {
    message: err.message,
  }
  if (process.env.SERVERLESS_STAGE !== 'prod') {
    body.stack = err.stack
  }
  return res.status(err.status || 500).send({ error: err })
}

module.exports = [mongooseValidation, queryValidation, handleElastic, handleEvents, defaultError]
