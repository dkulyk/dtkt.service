import {app} from "./app";
import {redis} from "./redis";
import {NextFunction, Request, Response} from "express";
import {User} from "./entity/User";
import {getRepository} from "typeorm";

export const cookie = process.env.COOKIE || 'dksession';

let sessions: { [id: string]: Session } = {};

app.on('fresh', () => {
    sessions = {};
});

export interface Session {
    getId(): string;

    get(key: string, def: any): any;

    setCache(key: string, data: any, timeout?: number): void;

    getCache(key: string, def?: any): any;

    user(): Promise<User | null>;

    expire();
}

export abstract class BaseSession {
    private _cache: { [key: string]: any } = {};
    protected _user: User | null = void 0;
    private _timer;

    constructor(private id?: string, private _data?: { [key: string]: any }) {
    }

    getId(): string {
        return this.id;
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
            this._user = (await getRepository(User).findOne(userId, {relations: ['mailings']})) || null;
        }

        return this._user;
    }

    expire() {
        if (this.getId()) {
            clearTimeout(this._timer);
            this._timer = setTimeout(() => {
                delete sessions[this.getId()];
            }, 39 * 1000);
        }
    }
}

class CSession extends BaseSession implements Session {
    expire() {
        const key = 'session:' + this.getId();
        redis.expire(key, 86400);
        redis.hset(key, 'last_active', Math.round(new Date().getTime() / 1000).toString());
        super.expire();
    }
}

export function middleware() {
    return function (request: Request, response: Response, next: NextFunction) {
        const id = request.cookies ? request.cookies[cookie] : '';
        getSession(id, request, response).then(() => {
            next();
        }, next);
    };
}

async function defaultHandler(id: string): Promise<Session> {
    return new Promise<Session | null>((resolve, reject) => {
        redis.hgetall('session:' + id, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            if (data === null) {
                resolve(new CSession(id, {}));
                return;
            }
            try {
                const session = new CSession(id, JSON.parse(data.contents));
                session.expire();
                resolve(session);
            } catch (e) {
                console.error('Parsing session error.');
                resolve(new CSession(id, {}));
            }
        });
    });
}

let handler: (id: string, req: Request, res: Response) => Promise<Session | null> | null = null;


export async function getSession(id:string, request: Request, response: Response): Promise<Session> {

    if (!id) {
        const session = await (handler || defaultHandler)(id, request, response);
        request['session'] = session;
        return session;
    }
    let session: Session;
    // if (sessions.hasOwnProperty(id)) {
    //     session = sessions[id];
    // } else {
        session = await (handler || defaultHandler)(id, request, response);
    // }

    request['session'] = session;
    session.expire();
   // sessions[id] = session;

    return session;
}


export function setSessionHandler(_handler: (id: string, req: Request, res: Response) => Promise<Session> | null) {
    handler = _handler;
}