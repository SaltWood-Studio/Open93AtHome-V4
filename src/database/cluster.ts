import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { randomString } from "../utilities";

@Entity()
export class ClusterEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    @Index()
    public clusterId: string;

    @Column()
    public clusterSecret: string;

    @Column()
    public banned: boolean;

    constructor() {
        this.id = 0;
        this.banned = false;
        this.clusterId = randomString(24);
        this.clusterSecret = randomString(32);
    }
}