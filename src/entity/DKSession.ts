import {BaseEntity, Column, Entity, PrimaryColumn} from "typeorm";
import {Buffer} from "buffer";
import * as phpunserialize from "phpunserialize";

@Entity('dk_sessions')
export class DKSession extends BaseEntity {
    @PrimaryColumn()
    session_id: string;

    @Column({type: 'int', unsigned: true})
    last_active: string;

    @Column({
        type: 'text',
        readonly: true,
        transformer: {
            to: (): string => {
                throw new Error('Readonly property.');
            },
            from: (value: string): string => {
                return phpunserialize(Buffer.from(value, 'base64').toString());
            }
        }
    })
    contents: any;
}