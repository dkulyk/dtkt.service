import * as express from "express";
import {Express, Request, Response} from "express";
import {Session} from "../session";
import {Blank} from "../entity/Blank";

export default function (app: Express) {
    const blanks = express();
    blanks.route('/addfavorite')
        .get(async (req: Request, res: Response) => {
            const
                session: Session = req['session'],
                user = await session.user();
            if (!user) {
                res.status(403);
                res.end();
                return;
            }
            const
                blanks = await Blank.createQueryBuilder('blank')
                    .innerJoin('blank.clients', 'clients')
                    .andWhere('blank.id IN (:ids)', {ids: req.query.i})
                    .andWhere('clients.id = :user', {user: user.id})
                    .getMany();

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(blanks.map((n: Blank) => n.id)));
        })
        .post(async (req: Request, res: Response) => {
            const
                session: Session = req['session'],
                user = await session.user();
            if (!user) {
                res.status(403);
                res.end();
                return;
            }

            const
                favorite = req.body.favorite !== 'false' && !!req.body.favorite,
                blank = await Blank.createQueryBuilder('blank')
                    .where('blank.id = :id', {uid: req.body.id})
                    .getOne();

            if (!blank) {
                res.status(404);
                res.end();
                return;
            }
            const rel = Blank.createQueryBuilder('blank')
                .relation(Blank, 'clients')
                .of(blank.id);

            await rel.remove(user.id);
            if (favorite) {
                await rel.add(user.id);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(favorite));
        });

    app.use('/blanks', blanks);
}
