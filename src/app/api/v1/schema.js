const identify = (name, prop) => {
  const test = prop.type || prop
  if (test === Number) {
    return 'number'
  } else if (test === String) {
    return 'string'
  } else if (test === Date) {
    return 'date'
  } else if (test instanceof Array) {
    return 'array'
  } else if (test instanceof Object) {
    return 'object'
  } else {
    throw new Error(`met unhandled type for prop: ${name}`)
  }
}

const buildSchema = (schema) => {
  return Object.entries(schema).reduce((result, [key, value]) => {
    const type = identify(key, value)
    result[key] = { ...value, type }
    switch (type) {
      case 'object':
        result[key].schema = buildSchema(value.type)
        break
      case 'array':
        if (value.type) {
          result[key].schema = buildSchema(value.type[0])
          break
        }
        result[key].schema = identify(key, value[0].type)
        break
    }
    return result
  }, {})
}

module.exports = (Model) => {
  return (req, res, next) => {
    try {
      return res.status(200).send(buildSchema(Model.schema.obj))
    } catch (err) {
      console.error(err)
      next(err)
    }
  }
}
