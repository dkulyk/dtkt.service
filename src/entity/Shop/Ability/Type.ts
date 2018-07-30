import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToMany,
    PrimaryGeneratedColumn,
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

    @Column({type: 'int', unsigned: true, default: 0})
    options: number;

    @CreateDateColumn({type: 'timestamp'})
    created_at: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updated_at: Date;

    @OneToMany(() => Ability, (ability: Ability) => ability.type)
    @JoinColumn({name: "type_id"})
    abilities: Ability[];
}