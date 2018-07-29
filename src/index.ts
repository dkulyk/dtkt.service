import "reflect-metadata";
import {config} from 'dotenv';
config();
import {app} from "./app";
import {createConnection} from "typeorm";

createConnection().then(()=>{
    app.listen(process.env.LISTEN_PORT);
});



