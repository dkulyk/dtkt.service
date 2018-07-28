import {app} from "./app";
import {redis} from "./redis";
import {NextFunction, Request, Response} from "express";
import {User} from "./entity/User";
import {getRepository} from "typeorm";

export const cookie = process.env.COOKIE || 'dksession';

let sessions: { [id: string]: CSession } = {};

app.on('fresh', () => {
    sessions = {};
});

export interface Session {
    getId(): string;

    get(key: string, def: any): any;

    setCache(key: string, data: any, timeout?: number): void;

    getCache(key: string, def?: any): any;

    user(): Promise<User | null>;
}

class CSession implements Session {
    private _timer;
    private _cache: { [key: string]: any } = {};
    private _user: User | null = void 0;

    constructor(private id: string, private _data: { [key: string]: any }) {
    }

    getId(): string {
        return this.id;
    }

    expire() {
        const key = 'session:' + this.getId();

        redis.expire(key, 86400);
        redis.hset(key, 'last_active', Math.round(new Date().getTime() / 1000).toString());

        if (this.getId()) {
            clearTimeout(this._timer);
            this._timer = setTimeout(() => {
                delete sessions[this.getId()];
            }, 10 * 60 * 1000);
        }
    }

    get(key: string, def: any) {
        return this._data.hasOwnProperty(key) ? this._data[key] : def;
    };

    setCache(key: string, data: any, timeout: number = 0) {
        let timer;
        if (this._cache.hasOwnProperty(key) && this._cache[key][1]) {
            clearTimeout(this._cache[key][1]);
        }
        if (timeout) {
            timer = setTimeout(() => {
                this.clearCache(key);
            }, timeout * 1000);
        }
        this._cache[key] = [data, timer];
    };

    clearCache(key: string) {
        if (this._cache.hasOwnProperty(key)) {
            this._cache[key][1] && clearTimeout(this._cache[key][1]);
            delete this._cache[key];
        }
    }

    getCache(key: string, def: any = void 0): any {
        if (this._cache.hasOwnProperty(key)) {
            return this._cache[key][0];
        }
        return def;
    };

    async user(): Promise<User | null> {
        if (this._user !== void 0) {
            return this._user;
        }
        const userId = this.get('user', null);

        if (!userId) {
            this._user = null;
        } else {
            this._user = (await getRepository(User).findOne(userId,{relations:['mailings']})) || null;
        }

        return this._user;
    }
}

export function middleware() {
    return function (request: Request, response: Response, next: NextFunction) {
        getSession(request).then(() => {
            next();
        }, next);
    };
}


export async function getSession(request: Request): Promise<Session | null> {
    const id = request.cookies ? request.cookies[cookie] : void 0;
    return new Promise<Session | null>((resolve, reject) => {
        if (!id) {
            request['session'] = new CSession(null, {});
            resolve(request['session']);
            return;
        }
        if (sessions.hasOwnProperty(id)) {
            request['session'] = sessions[id];
            sessions[id].expire();
            resolve(sessions[id]);
            return;
        }

        redis.hgetall('session:' + id, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            if (data === null) {
                request['session'] = new CSession(null, {});
                resolve(request['session']);
                return;
            }
            try {
                const session = new CSession(id, JSON.parse(data.contents));
                sessions[id] = session;
                request['session'] = session;
                session.expire();
                resolve(session);
            } catch (e) {
                console.error('Parsing session error.');
                request['session'] = new CSession(null, {});
                resolve(request['session']);
            }
        });
    });
}