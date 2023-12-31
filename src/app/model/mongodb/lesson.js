const { Schema } = require('mongoose')
const { createModel } = require('../../services/mongodb')
const { trim } = require('../../util/schema-setters')

const schema = {
  title: { type: String, index: 'text', required: true, set: trim },
  description: { type: String, default: '' },
  html: { type: String, default: '' },
}

module.exports = createModel('lessons', schema, (s) => {})
