import {BaseSession, Session, setSessionHandler} from "./session";
import {DKSession} from "./entity/DKSession";
import {getRepository} from "typeorm";

class CSession extends BaseSession implements Session {
    expire() {
        super.expire();
    }
}

setSessionHandler(async (id: string): Promise<Session | null> => {
    const record = await getRepository(DKSession).findOne(id);
    if (record) {
        return new CSession(record.session_id, record.contents);
    }
    return new CSession();
});