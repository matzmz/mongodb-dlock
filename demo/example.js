const mongoose = require('mongoose');
const LockManager = require('../index').LockerManager;

const uri = 'mongodb://mongoadmin:secret@localhost:27017/locks?authSource=admin'

const lockManager = new LockManager();
let counter = 0;

function log(pid,key,blocking,message){
    console.log(`:: ${pid} > ${key} > ${blocking ? '(wait) ' : ''}${message}`);
}

function getPid(){
    counter = counter + 1;
    return counter.toString().padStart(2, "0");
}

function lockTask(key, ttl, blocking = false, duration = 10000) { 
    const pid = getPid();

    return function () {
            log(pid,key,blocking,'requesting lock');
            const prom = blocking ?lockManager.waitLock(key, ttl) : lockManager.lock(key, ttl);
            prom.then((unlock) => {
                log(pid,key,blocking,'lock successfully acquired');
                return new Promise(resolve => {
                    log(pid,key,blocking,`calculation ... (${duration}ms)`);
                    setTimeout(() => {
                        return unlock()
                            .then(() => {
                                return resolve()
                            });
                    }, duration)
                })
                .then(() => {
                    log(pid,key,blocking,`lock successfully released`);    
                });
            })
            .catch(err => {
                log(pid,key,blocking,`impossible to acquire lock (err: ${err.code})`);
            });
    }
}

mongoose.connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    family: 4
}).then((db) => {
    lockManager.init(mongoose.connection);

    setTimeout(lockTask('foo', 10, false), 1000);
    setTimeout(lockTask('foo', 10, true), 1500);
    setTimeout(lockTask('foo', 10, false), 3000);
    setTimeout(lockTask('foo', 15, true), 10000);
    setTimeout(lockTask('foo', 10, false), 11000);

    setTimeout(lockTask('bar', 0, false), 1000);
    setTimeout(lockTask('bar', 0, false), 1500);
    setTimeout(lockTask('bar', 0, false), 3000);
    setTimeout(lockTask('bar', 0, false), 10000);
    setTimeout(lockTask('bar', 0, true, 100000), 15000);
});


