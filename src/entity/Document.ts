import {BaseEntity, Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";
import {Meta} from "./Document/Meta";

@Entity('docs2_docs')
export class Document extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', length: 15})
    uid: string;

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
    @JoinTable({
        name: 'docs2_clients',
        joinColumn: {name: 'document_uid', referencedColumnName: 'uid'},
        inverseJoinColumn: {name: 'client_id'}
    })
    clients: User[];

    @OneToOne(() => Meta, (m: Meta) => m.document, {eager: true})
    @JoinColumn({
        name: 'uid', referencedColumnName: 'uid'
    })
    meta: Meta;
}
