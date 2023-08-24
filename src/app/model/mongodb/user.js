const { Schema } = require('mongoose')
const { createModel } = require('../../services/mongodb')
const { trim } = require('../../util/schema-setters')

const schema = {
  title: { type: String, index: 'text', required: true, set: trim },
  description: { type: String, default: '' },
  lesson_ids: { type: [Schema.Types.ObjectId], default: [] },
}

module.exports = createModel('modules', schema, (s) => {})
