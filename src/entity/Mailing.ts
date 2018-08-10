import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

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

    // //Hack
    // @ManyToMany((a) => User, (user) => user.phones)
    // @JoinColumn({name: "id", referencedColumnName:'mailing_id'})
    // entity: any;
}