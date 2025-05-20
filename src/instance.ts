import express, { Request, Response } from "express";
import 'reflect-metadata';
import { DataSource, ServerClosedEvent } from 'typeorm';
import { Server } from "socket.io";
import { createServer } from "http";
import { SocketEventHandler } from "./client/handler";
import { ClusterEntity } from "./database/cluster";
import JwtHelper from "./jwt";
import { validateObject } from "./client/model-checker";
import { computeSignature } from "./utilities";

export class ServerInstance {
    app: express.Application;
    dataSource: DataSource;
    io: Server;
    server: ReturnType<typeof createServer>;
    handler: SocketEventHandler;
    jwt: JwtHelper;

    constructor(dataSource: DataSource) {
        this.app = express();
        this.jwt = new JwtHelper(JwtHelper.generateKeys());
        this.dataSource = dataSource;
        this.server = createServer(this.app);
        this.io = new Server(this.server);
        this.handler = new SocketEventHandler();
        this.handler.addHandler("enable", (ack, data) => {

        });

        this.io.on("connection", (socket) => {
            this.handler.handle(socket);
        });
    }

    start() {
        this.app.listen(3000, () => {
            console.log("Server started on port 3000");
        });
    }

    init() {

    }

    setupExpress() {
        this.app.get('/openbmclapi-agent/challenge', async (req: Request, res: Response) => {
            const data = validateObject({
                clusterId: ""
            }, req.query);

            const cluster = await this.dataSource.manager.findOne(ClusterEntity, {
                where: { clusterId: data.clusterId }
            });

            if (cluster) {
                if (cluster.banned) {
                    res.status(403).json({ error: "Cluster is banned." });
                    return;
                }
                const challenge = this.jwt.issueToken(
                    { clusterId: data.clusterId },
                    'cluster-challenge',
                    5 * 60
                );
                res.status(200).json({ challenge });
                return;
            }
            res.status(404).json({ error: "Cluster not found." });
        });
        this.app.post('/openbmclapi-agent/token', async (req: Request, res: Response) => {
            const data = validateObject({
                clusterId: "",
                signature: "",
                challenge: ""
            }, req.body);

            if (req.body.token) {
                const token = String(req.body.token);
                const claims = this.jwt.verifyToken(token, 'cluster') as { clusterId: string };
                if (!(await this.dataSource.manager.findOne(ClusterEntity, { where: { clusterId: claims.clusterId } }))) {
                    res.status(401).json({ error: "Cluster not found. But, how did you done it?" });
                    return;
                }
                const newToken = this.jwt.issueToken(
                    { clusterId: data.clusterId },
                    'cluster',
                    24 * 60 * 60
                );
                res.status(200).json({
                    token: newToken,
                    ttl: 24 * 60 * 60 * 1000
                });
                return;
            }

            const claims = this.jwt.verifyToken(data.challenge, 'cluster-challenge') as { clusterId: string };
            const cluster = await this.dataSource.manager.findOne(ClusterEntity, { where: { clusterId: claims.clusterId } });

            if (cluster) {
                if (claims && claims.clusterId === data.clusterId && computeSignature(data.challenge, data.signature, cluster.clusterSecret)) {
                    const token = this.jwt.issueToken(
                        { clusterId: data.clusterId },
                        'cluster',
                        24 * 60 * 60
                    );

                    res.status(200).json({
                        token,
                        ttl: 24 * 60 * 60 * 1000
                    });
                    return;
                }

                res.status(403).json({
                    error: "Invalid signature or challenge."
                });
                return;
            }
            
            res.status(404).json({
                error: "Cluster not found."
            });
        });
    }
}