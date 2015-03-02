const _ = require('lodash');
const Kapow = require('kapow');

module.exports = function(errs, defaultErr) {
    var resp;

    if (!Array.isArray(errs)) {
      errs = [errs];
    }

    resp = _.transform(errs, function(result, err) {
      if (!err.httpStatus) {
        err = Kapow.wrap(err, defaultErr);
      }

      var httpStatus = err.httpStatus;

      result.code[httpStatus] = result.code[httpStatus] ? result.code[httpStatus] + 1 : 1;

      result.data.errors.push({
        title: err.title,
        detail: err.message
      });
    }, {
      code: {},
      data: {
        errors: []
      }
    });

    resp.code = _.reduce(resp.code, function(result, n, key) {
      if (!result || n > resp.code[result]) {
        return key;
      }
      return result;
    }, '');

    return resp;
};
