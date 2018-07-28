import "reflect-metadata";

import {app} from "./app";
import {createConnection} from "typeorm";

createConnection().then(()=>{
    app.listen(8080);
});



