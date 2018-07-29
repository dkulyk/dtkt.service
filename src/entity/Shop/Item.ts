import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../User";
import {Ability} from "./Ability";

@Entity('shop_subscribe')
export class Item extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({type: 'tinyint', width: 1, unsigned: true, default: 0})
    active: number;

    @Column({type: 'tinyint', width: 1, unsigned: true, default: 0})
    periodical: number;

    @Column({type: 'int', unsigned: true, default: 0})
    count: number;

    @Column({type: 'int', unsigned: true, nullable: true, default: null})
    begin: number | null;

    @Column({type: 'int', unsigned: true, nullable: true, default: null})
    end: number | null;

    @Column({type: 'char', length: 2, nullable: true, default: null})
    lang: string | null;

    @ManyToOne(type => User, (user: User) => user.abilities)
    @JoinColumn({name: "user_id"})
    user: User;

    @OneToMany(type => Ability, (ab: Ability) => ab.item)
    abilities: Ability[];

    @Column({type: 'int', unsigned: true})
    user_id: number;
}
