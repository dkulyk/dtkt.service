import {
    Column, CreateDateColumn,
    Entity,
    getRepository,
    JoinColumn,
    LessThan, ManyToOne,
    MoreThan,
    Not,
    OneToMany,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import {User} from "./User";

@Entity('phones')
export class Phone {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'int', unsigned: true})
    entity_id: number;

    @Column({type: 'varchar', length: 255})
    entity_type: string;

    @Column()
    phone: string;

    @Column({type: 'enum', enum: ['fixed', 'mobile', 'fax', 'pager', 'voip']})
    type: string;

    @Column({type: 'varchar', length: 10, nullable: true, default: null})
    ext: string;

    @Column({type: 'tinyint', width: 1, unsigned: true, default: 0})
    confirm: string;

    @Column({type: 'tinyint', width: 1, unsigned: true, default: 0})
    default: string;

    @Column({type: 'tinyint', width: 1, unsigned: true, default: 0})
    public: string;

    @CreateDateColumn({type: 'timestamp'})
    created_at: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updated_at: Date;

    @Column({type: 'timestamp', nullable: true, default: null})
    deleted_at: Date | null;

    //Hack
    @ManyToOne((a) => User, (user) => user.phones)
    @JoinColumn({name: "entity_id"})
    entity: any;
}