import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {User} from "../User";

@Entity('clients_remember_tokens')
export class RememberToken extends BaseEntity {
    @PrimaryColumn()
    id: string;

    @ManyToOne(() => User, {eager: true})
    @JoinColumn({name: "client_id"})
    user: User | null;

    @Column({type: 'varchar', length: 100})
    remember_token: string;
}