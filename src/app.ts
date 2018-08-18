import * as express from "express";
import {Response, Request, NextFunction} from "express";
import * as cookieParser from 'cookie-parser';

export const app = express();

import {middleware as sessionMiddleware} from "./session";

let _requests: number = 0, _active: number = 0;

export function requests(): number {
    return _requests;
}

export function active(): number {
    return _active;
}

let logs: { [key: string]: number }[] = [], currentLog: { [key: string]: number } = {};

const logInterval = setInterval(() => {
    logs.unshift(currentLog);
    currentLog = {};
    logs.length = 6;
}, 10000);
app.on('end', () => {
    clearInterval(logInterval);
});

export function log(): { [key: string]: number }[] {
    return logs;
}

app.use((req: Request, res: Response, next: NextFunction) => {
    ++_requests;
    ++_active;
    currentLog[req.path] = (currentLog[req.path] || 0) + 1;
    res.on('end', () => {
        --_active;
    });
    next();
});


import system from './pages/system1';
import user from './pages/user';
import news from './pages/news';
import docs from './pages/docs';
import bodyParser = require("body-parser");

system(app);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(sessionMiddleware());
app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.header('origin');
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    next();
});
user(app);
news(app);
docs(app);
