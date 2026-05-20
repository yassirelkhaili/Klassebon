import multer from "multer";
import { fromNodeHeaders } from "better-auth/node";
import type { Request, Response } from "express";
import { auth } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";
import { ReceiptRepository } from "../repositories/receiptRepository.js";
import { Utils } from "../utils/index.js";
import { AuthError, HttpError, ValidationError } from "../types/errors.js";

function createMulterConfig(): multer.Options {
  return {
    storage: multer.diskStorage({
      destination: Utils.getUploadsDirectory(),
      filename: Utils.generateUniqueReceiptName,
    }),
    fileFilter: Utils.rejectNonImageFiles,
    limits: { fileSize: Utils.maxReceiptSize },
  };
}

export function createReceiptUploadMulter(): multer.Multer {
  return multer(createMulterConfig());
}

export async function handleReceiptUploadRequest(req: Request, res: Response): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session?.user) {
      throw new AuthError("User not authenticated");
    }
    if (!req.file) {
      throw new ValidationError("No file uploaded");
    }

    const receiptRepository = new ReceiptRepository(prisma);
    const receipt = await receiptRepository.create({
      user: { connect: { id: session.user.id } },
      imagePath: req.file.path,
    });

    res.status(201).json({
      id: receipt.id,
      imagePath: receipt.imagePath,
      message: "Receipt uploaded. Call receipt.processOcr via tRPC to run OCR.",
    });
  } catch (error) {
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      const message = error instanceof Error ? error.message : "Internal server error";
      res.status(500).json({ error: message });
    }
  }
}
