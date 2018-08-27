import * as express from "express";
import {Express, Request, Response} from "express";
import favorite from "../utils/favorite";
import {getRepository, LessThan, MoreThan, Not} from "typeorm";
import {Content} from "../entity/Content";
import {Session} from "../session";
import {Ability} from "../entity/Shop/Ability";

export default function (app: Express) {
    const news = express();
    favorite(news.route('/addfavorite'), 'news');

    news.get('/hit', async (req: Request, res: Response) => {
        const content = await getRepository(Content).findOne(req.query.id);
        if (content) {
            await Content.createQueryBuilder('content')
                .update({
                    hits: () => '`hits` + 1'
                }).where({
                    id: content.id
                }).execute();
        }
        res.end();
    });

    function inlineContent(res: Response, content: Content, access: boolean) {
        res.end(`<input type="hidden" id="deny" value="${access ? '1' : '0'}" data-access="${(content.access0.abilities || []).join(',')}">`);
    }

    news.get('/inline', async (req: Request, res: Response) => {
        const content = await getRepository(Content).findOne({
            where: {id: req.query.id},
            relations: ['access0']
        });

        if (!content || !content.access0) {
            res.end('');
            return;
        }

        const session: Session = req['session'];
        const user = await session.user();
        if (!user) {
            return inlineContent(res, content, false);
        }

        if (content.access0.abilities === null) {
            return inlineContent(res, content, true);
        }

        const date = new Date;
        const month = date.getFullYear() * 12 + date.getMonth();
        const ability: Ability = await (await Ability.createQueryBuilder('ability')
            .innerJoin('ability.type', 'type')
            .where({
                user_id: user.id,
                active: 1,
                begin: Not(MoreThan(month)),
                end: Not(LessThan(month))
            })
            .andWhere('type.name in (:names)', {names: content.access0.abilities})
            .getOne());
        if (!ability) {
            return inlineContent(res, content, false);
        }

        return inlineContent(res, content, true);
    });

    app.use('/news', news);
}