import db from "../../models/index.js";

const { Document } = db;

// Only returns a document if it belongs to this user — prevents reading someone else's file by guessing an id
export async function getDocumentById(userId, documentId) {
  return Document.findOne({ where: { id: documentId, userId } });
}
