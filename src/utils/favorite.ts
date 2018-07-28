import {IRoute, Request, Response} from "express";
import {Content} from "../entity/Content";
import {Session} from "../session";
import {User} from "../entity/User";
import {getRepository} from "typeorm";

export default function (route: IRoute, section: string) {
    route.get(async (req: Request, res: Response) => {
        const
            session: Session = req['session'],
            user = await session.user();
        if (!user) {
            res.status(403);
            res.end();
            return;
        }
        const
            content = await Content.createQueryBuilder('content')
                .innerJoin('content.users', 'users')
                .where({section})
                .andWhereInIds(req.query.i)
                .andWhere('users.id = :user', {user: user.id})
                .getMany();

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(content.map((n: Content) => n.id)));
    }).post(async (req: Request, res: Response) => {
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
            content = await getRepository(Content).findOne(req.body.id, {
                where: {section}
            });

        if (!content) {
            res.status(404);
            res.end();
            return;
        }
        const rel = User.createQueryBuilder('user')
            .relation(User, 'content')
            .of(user.id);

        await rel.remove(content.id);
        if (favorite) {
            await rel.add(content.id);
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(favorite));
    });
}
