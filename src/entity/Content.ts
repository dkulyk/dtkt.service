import {
    BaseEntity,
    Column, CreateDateColumn,
    Entity,
    getRepository,
    JoinColumn, JoinTable,
    LessThan, ManyToMany, ManyToOne,
    MoreThan,
    Not,
    OneToMany,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import {User} from "./User";

@Entity('content')
export class Content extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'char', length: 8})
    section: string;
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

    @ManyToMany(() => User, (u: User) => u.content)
    @JoinTable({name: 'users_content', joinColumn: {name: 'content_id'}, inverseJoinColumn: {name: 'user_id'}})
    users: User[];
}