import * as express from "express";
import {Express, Request, Response} from "express";
import favorite from "../utils/favorite";
import {getRepository} from "typeorm";
import {Content} from "../entity/Content";

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

    app.use('/news', news);
}