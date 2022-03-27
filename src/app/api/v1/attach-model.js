const express = require('express')

class InvalidQueryError extends Error {
  constructor(msg) {
    super(msg)
    this.name = 'InvalidQueryError'
  }
}

const buildQuery = (query, params) => {
  if (params.populate) {
    delete params.populate
  }
  if (params.or) {
    if (typeof params.or === 'string') {
      params.or = [params.or]
    }
    params.or.forEach((p) => {
      const orQuery = {}
      if (!params[p]) {
        throw new InvalidQueryError(`${p} is listed as an 'or' parameter but does not exist in query params`)
      }
      orQuery[p] = params[p]
      query = query.or(orQuery)
      delete params[p]
    })
    delete params.or
  }
  return query.where(params)
}

const populateQuery = (query, populations) => {
  if (populations) {
    populations.forEach((p) => {
      console.info('populating', p)
      const arr = p.split('.')
      if (arr.length === 1) {
        query = query.populate(p)
      } else {
        const pop = {}
        let currentLevel = pop
        arr.forEach((level, i) => {
          currentLevel.path = level
          if (i !== arr.length - 1) {
            currentLevel.populate = {}
            currentLevel = currentLevel.populate
          }
        })
        query.populate(pop)
      }
    })
  }
  return query
}

module.exports = (Model) => {
  const router = express.Router()

  router.get('/_docs', require('./docs')(Model))

  router.get('/_schema', require('./schema')(Model))

  router.post('/_aggregate', require('./aggregate')(Model))

  router.get('/', async (req, res, next) => {
    try {
      req.context = await populateQuery(
        buildQuery(
          Model.find()
            .limit(req.limit || 100)
            .skip(req.skip || 0),
          req.query,
        ),
        req.populate,
      ).exec()
      next()
    } catch (err) {
      next(err)
    }
  })

  router.get('/:id', async (req, res, next) => {
    try {
      req.context = await populateQuery(Model.findById(req.params.id), req.populate).exec()
      next()
    } catch (err) {
      next(err)
    }
  })

  router.put('/:id', async (req, res, next) => {
    try {
      const doc = await Model.findById(req.params.id).exec()
      if (!doc) {
        return res.status(404).send()
      }
      for (let property in req.body) {
        doc[property] = req.body[property]
      }
      req.context = await doc.save()
      next()
    } catch (err) {
      next(err)
    }
  })

  router.post('/', async (req, res, next) => {
    try {
      req.context = await Model.create(req.body)
      next()
    } catch (err) {
      next(err)
    }
  })

  router.delete('/:id', async (req, res, next) => {
    try {
      const { n, deletedCount } = await Model.deleteOne({ _id: req.params.id }).exec()
      if (n > 0 && deletedCount > 0) {
        req.context = { success: true }
      } else {
        res.status(404)
      }
      next()
    } catch (err) {
      next(err)
    }
  })

  return router
}
