import {
    BaseEntity,
    Column,
    Entity,
    getRepository, IsNull,
    JoinColumn, JoinTable,
    LessThan, ManyToMany,
    MoreThan,
    Not,
    OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import {Ability} from "./Shop/Ability";
import {Phone} from "./Phone";
import {Mailing} from "./Mailing";
import {Content} from "./Content";
import {Credential} from "./User/Credential";

@Entity('users')
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    fname: string;

    @Column()
    lname: string;

    @Column()
    mname: string;

    @Column({type: 'char', length: 32})
    pass: string;


    get name(): string {
        return `${this.fname} ${this.lname}`.trim();
    }

    //
    // @Column()
    // lastName: string;
    //
    // @Column()
    // age: number;

    @OneToMany(() => Ability, (ability: Ability) => ability.user)
    @JoinColumn({name: "user_id"})
    abilities: Ability[];

    @OneToMany(() => Phone, (_: Phone) => _.entity)
    @JoinColumn({name: "entity_id", referencedColumnName: 'id'})
    phones: Phone[];

    @ManyToMany(() => Mailing)
    @JoinTable({name: 'mailing_users', joinColumn: {name: 'user_id'}, inverseJoinColumn: {name: 'mailing_id'}})
    mailings: Mailing[];

    @ManyToMany(() => Content)
    @JoinTable({name: 'users_content', joinColumn: {name: 'user_id'}, inverseJoinColumn: {name: 'content_id'}})
    content: Content[];

    @OneToMany(() => Credential, (c: Credential) => c.user)
    @JoinColumn({name: "client_id"})
    credentials: Credential[];

    // async abilities(): Promise<string[]> {
    //     let date = new Date;
    //     date = date.getFullYear() * 12 + date.getMonth();
    //     await getConnection().query('SELECT * FROM `dtkt_ua`.`shop_abilities` ' +
    //         'WHERE `user_id` =  :userId' +
    //         'AND `type_id` = 2 ' +
    //         'AND `active` = 1 ' +
    //         'AND ( `begin` <= ? OR `begin` is NULL) ' +
    //         'AND ( `end` >= ? OR `end` is NULL) ' +
    //         'LIMIT 1', {
    //         userId: this.id
    //     })
    // }

    public async getActiveAbilities(): Promise<Ability[]> {
        let date = new Date,
            month = date.getFullYear() * 12 + date.getMonth();
        return getRepository(Ability).find({
            where: {
                user_id: this.id,
                active: 1,
                begin: Not(MoreThan(month)),
                end: Not(LessThan(month))
            }
        });
    }

    public async getPhone(): Promise<Phone | null> {
        return await getRepository(Phone).findOne({
            where: {
                deleted_at: IsNull(),
                entity_type: 'client',
                entity_id: this.id,
                public: 1
            },
            order: {
                default: 'DESC',
                confirm: 'DESC'
            }
        });
    }
}
