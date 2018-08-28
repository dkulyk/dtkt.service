import {BaseEntity, Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";

@Entity('blanks')
export class Blank extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    // @Column({type: 'char', length: 8})
    // section: string;

    @Column({type: 'int', unsigned: true})
    hits: number = 0;
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

    @ManyToMany(() => User)
    @JoinTable({name: 'user_blanks', joinColumn: {name: 'blank_id'}, inverseJoinColumn: {name: 'user_id'}})
    clients: User[];
}