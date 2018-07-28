import {Session} from "./src/session";
import {Connection} from "mysql";

interface Request {
    session?: Session;

    connection(): Promise<Connection>;
}