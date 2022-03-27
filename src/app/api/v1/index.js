const router = require('express').Router()
const override = require('method-override')

const attachModel = require('./attach-model')
const errorHandler = require('./errors')

const models = require('../../model/mongodb/index').restModels

router.use(require('./modify-request'))
models.forEach((model) => {
  router.use(`/${model.collection.name}`, attachModel(model))
})
router.use('/_models', (req, res, next) => {
  try {
    req.context = models.map((m) => m.collection.name)
    next()
  } catch (err) {
    next(err)
  }
})
router.use(require('./send-request'))
router.use(override())
router.use(errorHandler)

module.exports = router
