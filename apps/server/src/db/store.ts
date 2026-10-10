import { isDbConnected } from './connect';
import { YDocModel, YDocChunkModel } from './models/YDoc';
import { BoardModel } from './models/Board';

// In-memory fallback caches
const memoryYDocStore = new Map<string, Buffer>();
const memoryBoardStore = new Map<string, any>();
const memoryRoomCodeIndex = new Map<string, string>(); // roomCode -> boardId

const CHUNK_SIZE = 8 * 1024 * 1024; // 8MB threshold for chunking (safe under MongoDB 16MB limit)

export async function loadYState(documentName: string): Promise<Uint8Array | null> {
  if (isDbConnected()) {
    try {
      const doc = await YDocModel.findById(documentName).lean();
      if (!doc) return null;

      if (doc.chunksCount > 1) {
        // Reassemble from chunks
        const chunks = await YDocChunkModel.find({ docId: documentName })
          .sort({ chunkIndex: 1 })
          .lean();
        const buffers = chunks.map((c) => c.data);
        return new Uint8Array(Buffer.concat(buffers));
      }

      return new Uint8Array(doc.state);
    } catch (err) {
      console.error(`[Store] Error loading YDoc ${documentName} from MongoDB:`, err);
    }
  }

  const mem = memoryYDocStore.get(documentName);
  return mem ? new Uint8Array(mem) : null;
}

export async function saveYState(documentName: string, state: Uint8Array): Promise<void> {
  const buffer = Buffer.from(state);
  const parts = documentName.split(':');
  const boardId = parts[1] || 'unknown';

  if (isDbConnected()) {
    try {
      if (buffer.length > CHUNK_SIZE) {
        // Chunked persistence
        const totalChunks = Math.ceil(buffer.length / CHUNK_SIZE);
        await YDocChunkModel.deleteMany({ docId: documentName });

        const chunkDocs = [];
        for (let i = 0; i < totalChunks; i++) {
          const start = i * CHUNK_SIZE;
          const end = Math.min(buffer.length, (i + 1) * CHUNK_SIZE);
          chunkDocs.push({
            docId: documentName,
            chunkIndex: i,
            data: buffer.subarray(start, end),
          });
        }
        await YDocChunkModel.insertMany(chunkDocs);

        await YDocModel.findByIdAndUpdate(
          documentName,
          {
            boardId,
            state: Buffer.alloc(0), // empty placeholder
            bytes: buffer.length,
            chunksCount: totalChunks,
            updatedAt: new Date(),
          },
          { upsert: true }
        );
      } else {
        await YDocModel.findByIdAndUpdate(
          documentName,
          {
            boardId,
            state: buffer,
            bytes: buffer.length,
            chunksCount: 1,
            updatedAt: new Date(),
          },
          { upsert: true }
        );
      }

      // Update board lastActiveAt
      await BoardModel.findByIdAndUpdate(boardId, { lastActiveAt: new Date() });
      return;
    } catch (err) {
      console.error(`[Store] Error saving YDoc ${documentName} to MongoDB:`, err);
    }
  }

  // In-memory fallback
  memoryYDocStore.set(documentName, buffer);
  const board = memoryBoardStore.get(boardId);
  if (board) {
    board.lastActiveAt = new Date();
  }
}

export async function createBoardInDb(data: any): Promise<any> {
  if (isDbConnected()) {
    const board = new BoardModel(data);
    await board.save();
    return board.toObject();
  }

  memoryBoardStore.set(data._id, { ...data, createdAt: new Date(), updatedAt: new Date() });
  memoryRoomCodeIndex.set(data.roomCode, data._id);
  return data;
}

export async function findBoardById(boardId: string): Promise<any | null> {
  if (isDbConnected()) {
    return await BoardModel.findById(boardId).lean();
  }
  return memoryBoardStore.get(boardId) || null;
}

export async function findBoardByRoomCode(roomCode: string): Promise<any | null> {
  if (isDbConnected()) {
    return await BoardModel.findOne({ roomCode }).lean();
  }
  const id = memoryRoomCodeIndex.get(roomCode);
  return id ? memoryBoardStore.get(id) || null : null;
}

export async function updateBoardInDb(boardId: string, updates: any): Promise<any | null> {
  if (isDbConnected()) {
    return await BoardModel.findByIdAndUpdate(boardId, updates, { new: true }).lean();
  }
  const existing = memoryBoardStore.get(boardId);
  if (!existing) return null;
  const updated = { ...existing, ...updates, updatedAt: new Date() };
  memoryBoardStore.set(boardId, updated);
  return updated;
}

export async function deleteBoardInDb(boardId: string): Promise<void> {
  if (isDbConnected()) {
    await BoardModel.findByIdAndDelete(boardId);
    await YDocModel.deleteMany({ boardId });
    await YDocChunkModel.deleteMany({ docId: new RegExp(`^board:${boardId}:`) });
    return;
  }
  const board = memoryBoardStore.get(boardId);
  if (board) {
    memoryRoomCodeIndex.delete(board.roomCode);
    memoryBoardStore.delete(boardId);
  }
}
