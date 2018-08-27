import * as express from "express";
import {Express} from "express";
import favorite from "../utils/favorite";

export default function (app: Express) {
    const consulting = express();
    favorite(consulting.route('/addfavorite'), 'consult');

    app.use('/consulting', consulting);
}