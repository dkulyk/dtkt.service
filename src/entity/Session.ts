import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {User} from "./User";

@Entity('sessions')
export class Session extends BaseEntity {
    @PrimaryColumn()
    id: string;

    @ManyToOne(() => User, {eager: true})
    @JoinColumn({name: "user_id"})
    user: User | null;

    @Column({type: 'varchar', length: 45})
    ip_address: string;

    @Column({type: 'text'})
    user_agent: string;

    @Column({type: 'text'})
    payload: string;

    @Column({type: 'int', unsigned: true})
    last_activity: number;
}