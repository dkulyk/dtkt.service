import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../User";

@Entity('docs_stats')
export class Stat extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'int', unsigned: true, default: 0})
    count: number;

    @Column({type: 'int', unsigned: true, default: 0})
    pdf: number;
    @Column({type: 'tinyint', unsigned: true})
    access: number;
    @Column({type: 'date'})
    date: string;

    @Column({type: 'int', unsigned: true})
    user_id: number;

    @ManyToOne(() => User)
    @JoinColumn({name: "user_id"})
    user: User;
}
