'use strict';

function generateQueryObj(objVar, key) {
  const o = {
    "where": {}
  };
  o[key] = objVars.query.id;
  return o;
}

function generateAPI(endpoint, model, key, addtional, verify) {

  const handlerDict = {
    "create": function*(objVar) {
      return yield model.create(objVar.body);
    },
    "list": function*(objVar) {
      console.log(objVar);
      return yield model.findAll({});
    },
    "detail": function*(objVar) {
      const o = generateQueryObj(objVar, key);
      const res = yield model.findAll(o);
      if (res.length < 1) {
        Promise.reject({
          // FIXME: Through out 404 error.
        });
        return;
      }
      return res[0];
    },
    "update": function*(objVar) {
      const o = generateQueryObj(objVar, key);
      return yield model.update(objVar.body, o);
    },
    "delete": function*(objVar) {
      const o = generateQueryObj(objVar, key);
      return yield model.update({
        "status": "DELETE",
      }, o);
    },
  }

  Object.keys(handlerDict).forEach(k => {
    if (verify && typeof verify[k] === 'object') {
      handlerDict[k].schema = verify[k];
    }
  });


  let o = [{
    "path": endpoint,
    "method": "get",
    "handler": handlerDict.list,
  }, {
    "path": `${endpoint}/:id`,
    "method": "get",
    "handler": handlerDict.detail,
  }, {
    "path": endpoint,
    "method": "post",
    "handler": handlerDict.create,
  }, {
    "path": `${endpoint}/:id`,
    "method": "put",
    "handler": handlerDict.update,
  }, {
    "path": `${endpoint}/:id`,
    "method": "delete",
    "handler": handlerDict.delete,
  }];

  o.forEach(param => {
    param = Object.assign(param, addtional);
  });
  return o;
}

module.exports = generateAPI;
