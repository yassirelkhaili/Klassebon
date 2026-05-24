import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Services } from "../types/enums.js";
import type { Request, Response } from "express";
import type multer from "multer";
import { type HealthResponse } from "../types/index.js";

export class Utils {
  public static maxReceiptSize = 10485760; // 10 MB
  private static allowedImageMimeTypes = /^image\/(jpeg|png|gif|webp|bmp|tiff)$/;

  static getUploadsDirectory(): string {
    const uploadsDirectory = path.resolve(Utils.getCurrentDirectory(), "..", "uploads");
    fs.mkdirSync(uploadsDirectory, { recursive: true });
    return uploadsDirectory;
  }

  static getCurrentDirectory(): string {
    return path.dirname(fileURLToPath(import.meta.url));
  }

  static generateUniqueReceiptName(
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ): void {
    const uniqueReceiptName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueReceiptName);
  }

  static rejectNonImageFiles(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void {
    cb(null, Utils.allowedImageMimeTypes.test(file.mimetype));
  }

  static returnHealthResponse(_req: Request, res: Response): void {
    const body: HealthResponse = { ok: true, service: Services.Backend };
    res.json(body);
  }
}
