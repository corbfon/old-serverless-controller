const serverless = require('serverless-http')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const cors = require('cors')
require('../app/model/mongodb')
const { connect } = require('../app/services/mongodb')

app.use(bodyParser.json())
app.use(cors())
app.use('/api', require('../app/api'))

// or as a promise
const api = serverless(app)
const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const warmerIntercept = require('../app/util/warmer-intercept')
  if (warmerIntercept(event)) {
    connect(true, () => {
      console.log('connected after refresh')
      return
    })
  } else {
    const result = await api(event, context)
    return result
  }
}

module.exports = { handler }
