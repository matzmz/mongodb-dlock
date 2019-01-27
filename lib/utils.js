const _ = require('lodash');
const constants = require('./constants');

function pause(ms) {
    const delay = ms > 0 ?
        ms :
        _.random(constants.RETRY_INTERVAL_RANGE.min, constants.RETRY_INTERVAL_RANGE.max);
    return new Promise(res => setTimeout(() => res(delay), delay));
}

function attemp(fn, timeout = constants.RETRY_TIMEOUT_RANGE.max) {
    return fn().catch(err => timeout > constants.RETRY_TIMEOUT_RANGE.min ?
        pause().then((delay) => attemp(fn, timeout - delay)) :
        Promise.reject(err));
}

function error(code, message) {
    const err = new Error(message);
    err.code = code;
    return err;
}