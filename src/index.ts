import "reflect-metadata";
import {config} from 'dotenv';

config();
import {app} from "./app";
//import './dksession';
import {createConnection} from "typeorm";

createConnection().then(() => {
    app.listen(process.env.LISTEN_PORT);
});
