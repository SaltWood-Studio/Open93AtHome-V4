import { Server, Socket } from "socket.io";

export class SocketEventHandler {
    private handlers: Map<string, (ack: ((data: object) => void), data: any) => void> = new Map();

    constructor() {}

    public addHandler<T>(event: string, callback: (ack: ((data: object) => void), data: T) => void) {
        this.handlers.set(event, callback);
    }

    public removeHandler(event: string) {
        this.handlers.delete(event);
    }

    public handle<T>(socket: Socket) {
        for (const handler of this.handlers) {
            socket.on(handler[0], (...args: any[]) => {
                const index = args.findIndex((arg) => typeof arg === "function");
                const func = index >= 0 ? args[index] : () => {};
                const data = index >= 0 ? args.slice(0, index) : args;
                handler[1](func, data);
            });
        }
    }
}