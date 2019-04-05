import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import {User} from "./User";
import { Content } from "./Content";

@Entity('questions')
export class Question extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'tinyint', width: 1, unsigned: true, default: 0})
    resolution: string;

    // @Column({type: 'tinyint', unsigned: true})
    // hits: number = 0;
    //
    // @Column({type: 'varchar', length: 255})
    // title_uk: string;
    //
    // @Column({type: 'tinyint', width: 1, unsigned: true, default: 0})
    // public: string;
    //
    // @Column({type: 'tinyint', width: 1, unsigned: true, default: 0})
    // protected: string;
    //
    // @Column({type: 'tinyint', width: 1, unsigned: true, default: 0})
    // assign: string;

    @ManyToOne(() => User)
    @JoinColumn({name: "user_id"})
    user: User;

    @ManyToOne(() => Content)
    @JoinColumn({name: "consult_id"})
    consult: Content;
}