import {Express, Request, Response} from "express";
import {cookie, Session} from "../session";
import {Ability} from "../entity/Shop/Ability";
import {Mailing} from "../entity/Mailing";
import {Item} from "../entity/Shop/Item";

const handler = async (req: Request, res: Response) => {
    let session: Session = req['session'],
        ping = session.getCache('ping');
    if (!ping) {
        try {
            let user = await session.user(), abilities = [], mailings = [], phone, leftSubscribe = null;
            if (user) {
                abilities = (await user.getActiveAbilities()).map((ability: Ability) => ability.type.name);
                phone = await user.getPhone();
                mailings = user.mailings.map((m: Mailing) => m.id);

                let item = await Item.createQueryBuilder('item')
                    .innerJoin('item.user', 'user')
                    .where({
                        'periodical': 1,
                        'active': 1
                    })
                    .andWhere('user.id = :user', {user: user.id})
                    .addOrderBy('end', 'DESC')
                    .getOne();

                if (item) {
                    let date: Date = new Date();
                    date.setHours(0, 0, 0);
                    let dateSubscribe = new Date(Math.floor(item.end / 12), item.end % 12 + 1, 0, 0, 0, 0);
                    leftSubscribe = Math.floor((dateSubscribe.getTime() - date.getTime()) /  86400000) + 1;
                }
            }

            ping = {
                id: user ? user.id : 0,
                email: user ? user.email : '',
                name: user ? user.name : '',
                abilities,
                mailings,
                sname: cookie,
                sid: session.getId(),
                phone: phone ? phone.phone : '',
                leftSubscribe
            };

            session.setCache('ping', ping, 300);
        } catch (e) {
            console.log(e);
            res.statusCode = 500;
            res.end(e.toString());
            return;
        }
    }
    if (req.query.callback) {
        res.setHeader('Content-Type', 'application/x-javascript');
        res.end(`${req.query.callback}(${JSON.stringify(ping)});`);
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(ping));
    }
};
export default function (app: Express) {
    app.get('/auth/ping', handler);
    app.get('/ping', handler);
}


