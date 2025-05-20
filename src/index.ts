import { DataSource } from "typeorm";
import { ClusterEntity } from "./database/cluster";
import { ServerInstance } from "./instance";
import express from "express";

const dataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "password",
    database: "open93athome",
    entities: [
        ClusterEntity
    ]
});

const instance = new ServerInstance( dataSource);
instance.start();