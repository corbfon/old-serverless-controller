module.exports = (req, res, next) => {
  try {
    const { query } = req
    if (query.populate) {
      if (typeof query.populate === 'string') {
        req.populate = [query.populate]
      } else {
        req.populate = query.populate
      }
      delete query.populate
    }
    if (query.limit) {
      req.limit = parseInt(query.limit)
      delete query.limit
    }
    if (query.skip) {
      req.skip = parseInt(query.skip)
      delete query.skip
    }
    next()
  } catch (err) {
    next(err)
  }
}
