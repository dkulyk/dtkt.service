import * as express from "express";
import {Express} from "express";
import favorite from "../utils/favorite";

export default function (app: Express) {
    const news = express();
    favorite(news.route('/addfavorite'), 'news');

    app.use('/news', news);
}