import avsc from "avsc";

export const FileListSchema = avsc.Type.forSchema({
    type: 'array',
    items: {
        name: 'files',
        type: 'record',
        fields: [
            { name: 'path', type: 'string' },
            { name: 'hash', type: 'string' },
            { name: 'size', type: 'long' },
            { name: 'lastModified', type: 'long' },
        ],
    },
});

export type File = {
    path: string;
    hash: string;
    size: number;
    lastModified: number;
}

export class FileList {
    private _files: File[];

    constructor() {
        this._files = [];
    }
}