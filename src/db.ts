import "reflect-metadata";
import * as mysql from 'mysql';
import {PoolConnection} from "mysql";
import {getConnection} from "typeorm";


getConnection()
export const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

export function connection(): Promise<PoolConnection> {
    return new Promise<PoolConnection>((resolve, reject) => {
        pool.getConnection((err, connection) => {
            err ? reject(err) : resolve(connection);
        });
    });
}

