import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../User";
import {Type} from "./Ability/Type";
import {Item} from "./Item";

@Entity('shop_abilities')
export class Ability extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'tinyint', width: 1, unsigned: true, default: 0})
    active: number;

    @Column({
        type: 'int', unsigned: true, default: 0, transformer: {
            to(value: any) {
                return value;
            },
            from(value: any): number {
                return parseInt(value);
            }
        }
    })
    count: number;

    @Column({type: 'int', unsigned: true, default: 0})
    total: number;

    @Column({type: 'int', unsigned: true, nullable: true, default: null})
    begin: number | null;

    @Column({type: 'int', unsigned: true, nullable: true, default: null})
    end: number | null;

    @Column({type: 'char', length: 2, nullable: true, default: null})
    lang: string | null;

    @ManyToOne(() => User, (user: User) => user.abilities)
    @JoinColumn({name: "user_id"})
    user: User;

    @Column({type: 'int', unsigned: true})
    user_id: number;

    @ManyToOne(() => Type, (type: Type) => type.abilities, {eager: true})
    @JoinColumn({name: "type_id"})
    type: Type;

    @Column({type: 'int', unsigned: true})
    type_id: number;

    @ManyToOne(() => Item, (item: Item) => item.abilities)
    @JoinColumn({name: "item_id"})
    item: Item;
}
