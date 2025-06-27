const calulateDelay = () => {
    var now = new Date();
    var interval = 60 * 60 * 1000; // 60 minutes in milliseconds
    return interval - (now.getMinutes() * 60 + now.getSeconds()) * 1000 + now.getMilliseconds();
}

var delay = calulateDelay() - 120000;

var counter = 0;

const counterTick = () => {
    postMessage({counter, delay: (delay / 1000).toFixed(2)});
    counter++;
}

counterTick();