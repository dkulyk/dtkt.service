import {Express, Request, Response} from "express";
import {cookie, Session} from "../session";
import {Ability} from "../entity/Shop/Ability";
import {Mailing} from "../entity/Mailing";
import {Item} from "../entity/Shop/Item";
import {getRepository, LessThan, MoreThan, Not} from "typeorm";

const handler = async (req: Request, res: Response) => {
    let session: Session = req['session'],
        ping = session.getCache('ping', void 0);
    if (ping === void 0) {
        try {
            const user = await session.user();
            if (user) {
                const date = new Date;
                const month = date.getFullYear() * 12 + date.getMonth();
                const abilities: { [key: string]: any } = (await Ability.createQueryBuilder('ability')
                    .innerJoin('ability.type', 'type', 'type.name IS NOT NULL')
                    .addSelect('type')
                    .addSelect("SUM(ability.count)", 'ability_count')
                    .groupBy('type_id')
                    .where({
                        user_id: user.id,
                        active: 1,
                        begin: Not(MoreThan(month)),
                        end: Not(LessThan(month))
                    })
                    .getMany())
                    .reduce((result: { [key: string]: any }, ability: Ability) => {
                        result[ability.type.name] = ability.type.options & 1 ? ability.count : true;
                        return result;
                    }, {});

                const phone = await user.getPhone();
                abilities.mailings = (await getRepository(Mailing).createQueryBuilder('mailing')
                    .innerJoin('mailing.users', 'users')
                    .where('user_id = :id', {id: user.id})
                    .getMany()).map((m: Mailing) => m.id);

                let item = await Item.createQueryBuilder('item')
                    .innerJoin('item.user', 'user')
                    .where({
                        'periodical': 1,
                        'active': 1
                    })
                    .andWhere('user.id = :user', {user: user.id})
                    .addOrderBy('end', 'DESC')
                    .getOne();
                let leftSubscribe = null;
                if (item) {
                    const date: Date = new Date();
                    date.setHours(0, 0, 0);
                    const dateSubscribe = new Date(Math.floor(item.end / 12), item.end % 12 + 1, 0, 0, 0, 0);
                    leftSubscribe = Math.floor((dateSubscribe.getTime() - date.getTime()) / 86400000) + 1;
                }
                ping = {
                    id: user ? user.id : 0,
                    email: user ? user.email : '',
                    name: user ? user.name : '',
                    abilities,
                    sname: cookie,
                    sid: session.getId(),
                    phone: phone ? phone.phone : '',
                    leftSubscribe
                };
            } else {
                ping = {
                    id: 0,
                    email: '',
                    name: '',
                    abilities: {},
                    sname: cookie,
                    sid: session.getId(),
                    phone: '',
                    leftSubscribe: 0
                }
            }


            session.setCache('ping', ping, 60);
        } catch (e) {
            console.log(e);
            res.statusCode = 500;
            res.end(e.toString());
            return;
        }
    }

    if (req.query.callback) {
        res.setHeader('Content-Type', 'application/x-javascript; charset=utf-8');
        res.end(`${req.query.callback}(${JSON.stringify(ping)});`);
    } else {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(ping));
    }
};

export default function (app: Express) {
    app.get('/auth/ping', handler);
    //temporary
    app.get('/ru/ping', handler);
    app.get('/ping', handler);
}
