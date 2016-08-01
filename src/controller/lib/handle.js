import RequestHandler from '../../request-handler';
import PayloadHandler from '../../payload-handler';
import * as send from './send';

module.exports = function (config, baseUrl) {
  const {method, responder, format, store} = config;
  const requestHandler = new RequestHandler(config);
  const payloadHandler = new PayloadHandler(
    new format({
      store: store,
      baseUrl: baseUrl
    })
  );

  return function (request, response) {
    const server = 'express'; // detect if hapi or express here
    const process = requestHandler[method].bind(requestHandler);
    let serialize, beforeSend;
    if (config.actions && config.actions[method] && config.actions[method].serialize) {
      serialize = config.actions[method].serialize || (x => x);
    }
    const format = payloadHandler[method].bind(payloadHandler, config);
    if (config.actions && config.actions[method] && config.actions[method].beforeSend) {
      beforeSend = config.actions[method].beforeSend || (x => x);
    }
    const respond = (responder ? responder : send[server]).bind(null, response);
    const errors = requestHandler.validate(request);

    if (errors) {
      respond(payloadHandler.error(errors));
    } else {
      process(request)
        .then(serialize)
        .then(format)
        .then(beforeSend)
        .then(respond)
        .catch(function (err) {
          //throw err;
          return respond(payloadHandler.error(err));
        });
    }
  };
};
