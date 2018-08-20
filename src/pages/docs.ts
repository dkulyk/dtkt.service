import * as express from "express";
import {Express, Request, Response} from "express";
import {Session} from "../session";
import {getConnection, getRepository, LessThan, MoreThan, Not} from "typeorm";
import {Document} from "../entity/Document";
import {Stat} from "../entity/Document/Stat";
import {Ability} from "../entity/Shop/Ability";
import {Meta} from "../entity/Document/Meta";

export default function (app: Express) {
    const docs = express();
    docs.route('/addfavorite')
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
                document = await Document.createQueryBuilder('document')
                    .innerJoin('document.clients', 'clients')
                    .andWhere('document.uid IN (:uids)', {uids: req.query.i})
                    .andWhere('clients.id = :user', {user: user.id})
                    .getMany();

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(document.map((n: Document) => n.uid)));
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
                document = await Document.createQueryBuilder('document')
                    .where('document.uid = :uid', {uid: req.body.id})
                    .getOne();

            if (!document) {
                res.status(404);
                res.end();
                return;
            }
            const rel = Document.createQueryBuilder('document')
                .relation(Document, 'clients')
                .of(document.uid);

            await rel.remove(user.id);
            if (favorite) {
                await rel.add(user.id);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(favorite));
        });

    docs.get('/access', async (req: Request, res: Response) => {
        const document = await getRepository(Document).findOne({
            where: {
                uid: req.query.uid
            }
        });
        if (!document) {
            res.end();
            return;
        }

        Document.createQueryBuilder('document')
            .update(Meta)
            .where("uid = :uid", {uid: document.uid})
            .set({
                hits: () => "hits + 1"
            })
            .execute();

        const session: Session = req['session'];
        const user = await session.user();


        (async () => {
            const date = new Date;
            let access = 1;
            if (user) {
                const month = date.getFullYear() * 12 + date.getMonth();
                const ability: Ability = await (await Ability.createQueryBuilder('ability')
                    .innerJoin('ability.type', 'type', 'type.name = :name', {name: 'documents'})
                    .where({
                        user_id: user.id,
                        active: 1,
                        begin: Not(MoreThan(month)),
                        end: Not(LessThan(month))
                    })
                    .getOne());

                access = ability ? 3 : 2;
            }
            const user_id = user ? user.id : 0;
            const dateString = date.toISOString().replace(/T.*/, '');

            const q1 = Stat.createQueryBuilder('stat')
                .insert()
                .values({
                    user_id: user_id,
                    pdf: 0,
                    count: 1,
                    access: access,
                    date: dateString
                }).getQueryAndParameters();

            const q2 = Stat.createQueryBuilder('stat')
                .update({
                    count: () => '`count` + 1'
                }).getQueryAndParameters();

            await getConnection().query(`${q1[0]} ON DUPLICATE KEY ${q2[0].replace(/UPDATE .* SET/, 'UPDATE')}`, q1[1]);
        })();

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            hits: document.meta.hits + 1
        }));
    });

    function inlineDoc(res: Response, document: Document, access: boolean) {
        res.end(`<input type="hidden" id="doc_access" value="${access ? '1' : '0'}" data-access="${document.meta.access}">`);
    }

    docs.get('/inline', async (req: Request, res: Response) => {
        const document = await getRepository(Document).findOne({
            where:{uid:req.query.uid}
        });
        if (!document || document.meta.access === 1) {
            res.end('');
            return;
        }

        const session: Session = req['session'];
        const user = await session.user();
        if (!user) {
            return inlineDoc(res, document, false);
        }
        if (document.meta.access > 2) {
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
                .andWhere('type.name = :name', {name: 'documents'})
                .getOne());
            if (!ability) {
                return inlineDoc(res, document, false);
            }
        }
        return inlineDoc(res, document, true);
    });
    app.use('/documents', docs);
}
