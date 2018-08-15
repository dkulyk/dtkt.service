import {BaseEntity, Column, Entity, JoinColumn, OneToOne} from "typeorm";
import {Document} from "../Document";

@Entity('docs2_docs_meta')
export class Meta extends BaseEntity {
    @Column({type: 'varchar', length: 15, primary: true})
    uid: string;

    @Column({
        type: 'tinyint',
        unsigned: true,
        default: 1,
        transformer: {
            to(value: boolean): any {
                return value ? 1 : 0;
            },
            from(value: any): boolean {
                return !!value;
            }
        }
    })
    enabled: boolean = true;

    @Column({
        type: 'tinyint',
        unsigned: true,
        default: 0, transformer: {
            to(value: boolean): any {
                return value ? 1 : 0;
            },
            from(value: any): boolean {
                return !!value;
            }
        }
    })
    main: boolean = false;

    @Column({type: 'tinyint', unsigned: true})
    access: number;

    @Column({type: 'int', unsigned: true, default: 0})
    hits: number;

    @OneToOne(() => Document, (d: Document) => d.meta)
    @JoinColumn({
        name: 'uid', referencedColumnName: 'uid'
    })
    document: Document;
}
