import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {User} from "../User";

@Entity('clients_credentials')
export class Credential extends BaseEntity {
    @PrimaryColumn()
    id: string;

    @ManyToOne(() => User, {eager: true})
    @JoinColumn({name: "client_id"})
    user: User | null;

    @Column({type: 'varchar', length: 255})
    type: string;

    @Column({type: 'varchar', length: 255})
    value: string;

    @Column({type: 'timestamp', nullable: true, default: null})
    deleted_at: Date | null;
}
