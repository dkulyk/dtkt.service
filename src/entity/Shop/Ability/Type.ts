import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToMany,
    PrimaryGeneratedColumn,
    Timestamp,
    UpdateDateColumn
} from "typeorm";
import {Ability} from "../Ability";

@Entity('shop_abilities_types')
export class Type {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    active: number;

    @Column()
    caption: string;

    @CreateDateColumn({type: 'timestamp'})
    created_at: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updated_at: Date;

    @OneToMany(type => Ability, (ability: Ability) => ability.type)
    @JoinColumn({name: "type_id"})
    abilities: Ability[];
}