import {BaseSession, cookie, Session, setSessionHandler} from "./session";
import {Session as SessionEntity} from "./entity/Session";
import {getRepository} from "typeorm";
import {User} from "./entity/User";
import {Request, Response} from "express";
import {RememberToken} from "./entity/User/RememberToken";
import {Credential} from "./entity/User/Credential";

const remember_name = 'remember_web_59ba36addc2b2f9401580f014c7f58ea4e30989d';


function makeid(len: number = 16) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < len; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


class CSession extends BaseSession implements Session {
    constructor(id?: string, _data?: { [key: string]: any }, private session?: SessionEntity) {
        super(id, _data);
    }

    expire() {
        super.expire();
        if (this.session) {
            getRepository(SessionEntity).createQueryBuilder('sessions')
                .whereInIds(this.session.id)
                .update({
                    last_activity: Math.trunc(new Date().getTime() / 1000)
                }).execute();
        }
    }

    async user(): Promise<User | null> {
        if (this._user !== void 0) {
            return this._user;
        }
        this._user = null;

        if (this.session) {
            const matches = Buffer.from(this.session.payload, 'base64').toString().match(/s:50:"login_web_59ba36addc2b2f9401580f014c7f58ea4e30989d";i:(\d+);/);
            if (matches) {
                this._user = await getRepository(User).findOne(matches[1]);
            }
        }

        return this._user;
    }
}

setSessionHandler(async (id: string, req: Request, res: Response): Promise<Session | null> => {
    if (id) {
        const record = await getRepository(SessionEntity).findOne(id);
        if (record) {
            return new CSession(record.id, {}, record);
        }
    }

    const session = new SessionEntity();
    session.id = makeid(40);
    session.last_activity = Math.trunc(new Date().getTime() / 1000);
    session.payload = Buffer.from(`a:0:{}`).toString('base64');
    session.ip_address = req.socket.remoteAddress;
    session.user_agent = req.header('user-agent');

    const a: string | void = req.cookies[remember_name];

    if (a) {
        const v = a.split('|');
        const token = await getRepository(RememberToken).findOne({
            where: {
                client_id: v[0],
                remember_token: v[1]
            }
        });

        if (token) {
            const credential = await getRepository(Credential).createQueryBuilder()
                .where({
                    type: 'password',
                    deleted_at: null
                })
                .andWhere('client_id =  :id', {id: token.user.id})
                .getOne();
            if ((credential && credential.value === v[2]) || token.user.pass === v[2]) {
                session.payload = Buffer.from(`a:1:{s:50:"login_web_59ba36addc2b2f9401580f014c7f58ea4e30989d";i:${token.user.id};}`).toString('base64');
                session.user = token.user;
            }
        }
    }

    getRepository(SessionEntity).save(session);

    res.cookie(cookie, session.id, {
        path: '/',
        domain: process.env.COOKIES_DOMAIN || '.dtkt.ua',
        secure: true
    });
    return new CSession(session.id, {}, session);
});