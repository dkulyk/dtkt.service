import {Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";

@Entity('mailing')
export class Mailing {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', length: 255})
    title_ru: string;

    @Column({type: 'varchar', length: 255})
    title_uk: string;

    @Column({type: 'tinyint', width: 1, unsigned: true, default: 0})
    public: string;

    @Column({type: 'tinyint', width: 1, unsigned: true, default: 0})
    protected: string;

    @Column({type: 'tinyint', width: 1, unsigned: true, default: 0})
    assign: string;

    //Hack
    @ManyToMany(() => User,(u:User)=>u.mailings)
    @JoinTable({
        name: 'mailing_users',
        joinColumn: {name: 'mailing_id', referencedColumnName: 'id'},
        inverseJoinColumn: {name: 'user_id', referencedColumnName: 'id'}
    })
    users: User[];
}