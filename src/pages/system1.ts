import {app, requests} from "../app";
import {Express, Request, Response} from "express";

const scale = 6;
let _reqs = [], _req: number = 0;

let interval = setInterval(function () {
    const reqs = requests();
    _reqs.unshift(reqs - _req);
    _reqs.length = 20 * scale;
    _req = reqs;
}, 60 / scale * 1000);

export default function (app:Express) {
    app.on('end', () => {
        clearInterval(interval);
    });

    app.get('/terminate', function (req: Request, res: Response) {
        res.end('pending...');
        process.nextTick(() => {
            process.exit();
        })
    });

    app.get('/server', (req: Request, res: Response) => {
        res.type('text/plain');
        res.write('Server: ' + Object.keys(process.versions).map(function (app) {
            return app + ' ' + process.versions[app]
        }).join(' / ') + ' on ' + process.platform + '(' + process.arch + ')' + '\n');
        let mem = process.memoryUsage();
        res.write('Memory: ' + Object.keys(mem).map((app: string) => {
            return app + ' ' + Math.round(parseInt(mem[app]) / 1024) + 'k'
        }).join(' / ') + '\n');
        let u = process.uptime(), rps = [
            Math.round(_reqs.slice(0, scale).reduce(function (a, b) {
                return a + b;
            }, 0) / Math.min(60, u) * 10) / 10,
            Math.round(_reqs.slice(0, 5 * scale).reduce(function (a, b) {
                return a + b;
            }, 0) / Math.min(5 * 60, u) * 10) / 10,
            Math.round(_reqs.slice(0, 10 * scale).reduce(function (a, b) {
                return a + b;
            }, 0) / Math.min(10 * 60, u) * 10) / 10,
            Math.round(_reqs.slice(0, 20 * scale).reduce(function (a, b) {
                return a + b;
            }, 0) / Math.min(20 * 60, u) * 10) / 10
            //,Math.round(core.requests / u * 10) / 10
        ];
        res.write('Uptime: ' + Math.floor(u / 86400) + ':' + new Date(0, 0, 0, 0, 0, process.uptime()).toTimeString() + '\n');
        res.write('Requests: ' + requests() + '     ' + rps.join(' / ') + ' rps\n');
        //res.write(requests.join(' '));
        res.end();
    });
}
