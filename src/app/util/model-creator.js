const mongoose = require('mongoose')
const timestamps = require('mongoose-timestamp')

const transform = (doc, ret) => {
  delete ret.__v
}

module.exports = (modelName, schemaJson, decorator) => {
  if (mongoose.models[modelName]) return mongoose.models[modelName]
  const schema = new mongoose.Schema(schemaJson, {
    id: false,
    toObject: {
      transform,
      virtuals: true,
    },
    toJSON: {
      transform,
      virtuals: true,
    },
  })

  /** add indexes https://stackoverflow.com/questions/24714166/full-text-search-with-weight-in-mongoose */
  const indexes = Object.entries(schema.obj).reduce((result, [key, value]) => {
    if (value.index) {
      result[key] = value.index
    }
    return result
  }, {})
  schema.index(indexes)
  schema.plugin(timestamps, {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  })
  if (typeof decorator === 'function') {
    decorator(schema)
  }
  return mongoose.model(modelName, schema)
}
