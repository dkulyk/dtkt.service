import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity('content_access')
export class Access extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', length: 255})
    caption: string;

    @Column({
        type: 'text', transformer: {
            to(val: any): any {
                return val === null ? null : JSON.stringify(val);
            },
            from(val: any): any {
                return val === null ? null : JSON.parse(val);
            }
        }
    })
    abilities: string[] | null;
}
