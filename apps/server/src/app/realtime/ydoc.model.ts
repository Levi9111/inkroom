import mongoose, { Schema } from 'mongoose';

export interface IYDoc {
  _id: string; // Document name (e.g. board:abc:meta or board:abc:page:xyz)
  boardId: string;
  state: Buffer;
  bytes: number;
  chunksCount: number;
  updatedAt: Date;
}

const YDocSchema = new Schema<IYDoc>(
  {
    _id: { type: String, required: true },
    boardId: { type: String, required: true, index: true },
    state: { type: Buffer, required: true },
    bytes: { type: Number, required: true },
    chunksCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export const YDocModel = mongoose.models.YDoc || mongoose.model<IYDoc>('YDoc', YDocSchema);

export interface IYDocChunk {
  docId: string;
  chunkIndex: number;
  data: Buffer;
}

const YDocChunkSchema = new Schema<IYDocChunk>(
  {
    docId: { type: String, required: true, index: true },
    chunkIndex: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

YDocChunkSchema.index({ docId: 1, chunkIndex: 1 }, { unique: true });

export const YDocChunkModel =
  mongoose.models.YDocChunk || mongoose.model<IYDocChunk>('YDocChunk', YDocChunkSchema);
