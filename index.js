/*

  ________      ________ _____   _____  _____          _      ______
 |  ____\ \    / /  ____|  __ \ / ____|/ ____|   /\   | |    |  ____|
 | |__   \ \  / /| |__  | |__) | (___ | |       /  \  | |    | |__
 |  __|   \ \/ / |  __| |  _  / \___ \| |      / /\ \ | |    |  __|
 | |____   \  /  | |____| | \ \ ____) | |____ / ____ \| |____| |____
 |______|   \/   |______|_|  \_\_____/ \_____/_/    \_\______|______|
  / ____|                          | |
 | |     ___  _ __  _ __   ___  ___| |_
 | |    / _ \| '_ \| '_ \ / _ \/ __| __|
 | |___| (_) | | | | | | |  __/ (__| |_
  \_____\___/|_| |_|_| |_|\___|\___|\__|
 */
/**
 * @name Everscale connection provider
 * @copyright SVOI.dev Labs - https://svoi.dev
 * @license Apache-2.0
 * @version 1.0
 */
//let WORKERS = 1;
let WORKERS = (require('os').cpus().length) * 2;

const WORKER_SUICIDE_TIME =  5 * 60 * 1000;//5 min

const {FavoritoApp} = require('favorito');
const fs = require('fs');

const bodyParser = require('body-parser');

const cluster = require('cluster');

const config = require(__dirname + '/' + process.argv[2] ?? __dirname + '/config.js');

if(config.maxWorkers) {
    WORKERS = config.maxWorkers;
}


if(cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    console.log('Starting', WORKERS, 'workers');

    /**
     * Получает сообщения от воркеров и распространяет их по другим воркерам
     * @param msg
     */
    function messageHandler(msg) {
        if(msg.cmd) {
            //console.log('WORKER MSG', msg);

            //Broadcast message to all workers
            for (const id in cluster.workers) {
                try {
                    cluster.workers[id].send(msg);
                } catch (e) {
                    console.log('CLUSTER SEND ERROR', e);
                }
            }
        }
    }

    // Fork workers.
    for (let i = 0; i < WORKERS; i++) {
        let worker = cluster.fork();
        worker.on('message', messageHandler);
    }


    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Spawn new.`);
        console.log(code, signal);
        let newWorker = cluster.fork();
        newWorker.on('message', messageHandler);
    });
} else {

    (async () => {
        const express = require('express');
        const App = new FavoritoApp(__dirname + '/' + process.argv[2] ?? __dirname + '/config.js', 'EverscaleConnect ' + process.pid);
        await App.init();

        App.expressApp.use(bodyParser.json({limit: '50mb'}));
        App.expressApp.disable('view cache');
        App.expressApp.set('cache', false);
        App.expressApp.set('etag', false);


        App.expressApp.use('/modules/freeton', express.static('node_modules/freeton/src'));
        App.expressApp.use('/modules/ton-client-web-js', express.static('node_modules/ton-client-web-js/'));
        App.expressApp.use('/ton', express.static('dist'));
        App.expressApp.use('/ever', express.static('dist'));
        App.expressApp.use('/tonclient.wasm', express.static('dist/tonclient.wasm'));
        App.expressApp.use('/eversdk.wasm', express.static('dist/eversdk.wasm'));


        App.expressApp.use('/examples', express.static('examples'));

        const Twig = require('twig');
        const Utils = require('./modules/utils/utils')
        Twig.extendFilter("shortenPubkey", (text) => Utils.shortenPubkey(text));
        Twig.extendFilter("unsignedNumberToSigned", (text, args) => Utils.unsignedNumberToSigned(text, args[0]));
        Twig.extendFilter("numberToUnsignedNumber", (text, args) => Utils.numberToUnsignedNumber(text, args[0]));
        Twig.extendFilter("numberToPercent", (text, args) => Utils.numberToPercent(text));
        Twig.extendFilter('numberToPretty', (text, args) => Utils.numberToPretty(text, args[0]));


        await App.start();


        App.on('error', (error) => {
            console.log('ERR', error);
        })

        //App.db.newdb.db.options.logging = false;


        //let config = App.config;
        //let db = App.db.default;


    })()

    process.on('unhandledRejection', error => {
        console.error(error);
    });

    process.on('uncaughtException', error => {
        console.error(error);
    });

    /*setInterval(() => {
        process.send({cmd: 'test', data: {a: 1, b: 2}});
    }, 5000)

    process.on('message', (msg) => {
        console.log('WORKER NEW MESSAGE', process.pid, msg)
    });*/
    //console.log(`Worker ${process.pid} started`);

    if(WORKER_SUICIDE_TIME && WORKER_SUICIDE_TIME !== 0) {
        setTimeout(() => {
            console.log(`Worker ${process.pid} suicide`);
            process.exit();
        }, WORKER_SUICIDE_TIME + (Math.round(Math.random() * 10000)))
    }

}


process.on('unhandledRejection', error => {
    console.error(error);
});

process.on('uncaughtException', error => {
    console.error(error);
});
