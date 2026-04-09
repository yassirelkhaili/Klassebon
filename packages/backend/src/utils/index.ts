/**
 * @fileoverview Shared helpers for the backend: paths, multer upload rules,
 *               and health-check response helpers.
 * @module backend/utils
 * @requires express
 * @requires multer
 * @requires node:path
 * @requires node:url
 * @author Yassir Elkhaili
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { auth } from "../lib/auth.js";
import { Services } from "../types/enums.js";
import { fromNodeHeaders } from "better-auth/node";
import { PrismaClient } from "@prisma/client/extension";
import { AuthError, HttpError, ValidationError } from "../types/errors.js";
import { ReceiptRepository } from "../repositories/receiptRepository.js";
import type { Request, Response } from "express";
import type multer from "multer";
import { type CurrentSession, type HealthResponse } from "../types/index.js";

/**
 * @class
 * @classdesc Provides Utility classes.
 * Note: Method/Property names need to be descriptive and clear.
 */
export class Utils {
  public static maxReceiptSize = 10485760; // 10MB

  private static allowedImageMimeTypes = /^image\/(jpeg|png|gif|webp|bmp|tiff)$/;

  /**
   * Returns the absolute path to the uploads directory.
   */
  static getUploadsDirectory(): string {
    const uploadsDirectory = path.resolve(Utils.getCurrentDirectory(), "..", "uploads");
    return uploadsDirectory;
  }

  /**
   * Returns the current working directory
   */
  static getCurrentDirectory(): string {
    const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
    return currentDirectory;
  }

  /**
   * Generates a unique filename for uploaded files using timestamp and random number.
   * Prevents file name collisions
   * @param _req Request object (unused)
   * @param file Uploaded file with original filename
   * @param cb Callback returning generated filename
   */
  static generateUniqueReceiptName(
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ): void {
    const uniqueReceiptName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueReceiptName);
  }

  /**
   * Only allows supported image file types.
   * @see allowedImageMimeTypes
   * @param _req Request object (unused)
   * @param file Uploaded file with original filename
   * @param cb Callback to determine if file is allowed
   */
  static rejectNonImageFiles(
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ): void {
    const isFileAllowed: boolean = Utils.allowedImageMimeTypes.test(file.mimetype);
    cb(null, isFileAllowed);
  }

  /**
   * Reports if the backend is up and running
   * @param _req Request object (unused)
   * @param res Response object
   */
  static returnHealthResponse(_req: Request, res: Response): void {
    const body: HealthResponse = { ok: true, service: Services.Backend };
    res.json(body);
  }

  /**
   * Gets current session
   * @param req Request Object
   */
  static async getCurrentSession(req: Request) {
    const current_session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    return current_session;
  }

  /**
   * Checks if the user is authenticated
   * @param _req Request object
   * @returns {CurrentSession} current user session
   */
  static async isUserAuthenticated(req: Request): Promise<CurrentSession> {
    const current_session = await Utils.getCurrentSession(req);
    if (!current_session || !current_session.user) {
      throw new AuthError("User not authenticated");
    }
    return current_session;
  }

  /**
   * Checks receipt upload
   * @param _req Request object
   * @returns {Express.Multer.File} Uploaded file object
   */
  static async validateFileUploaded(req: Request): Promise<Express.Multer.File> {
    const uploaded_file = req.file;
    if (!uploaded_file) {
      throw new ValidationError("No file uploaded");
    }
    return uploaded_file;
  }

  /**
   * Handles receipt upload
   * @param _req Request object
   * @param res Response object
   */
  static async handleReceiptUpload(req: Request, res: Response): Promise<void> {
    try {
      const current_session = await Utils.isUserAuthenticated(req);
      const uploaded_file = await Utils.validateFileUploaded(req);

      const prisma = new PrismaClient();
      const receiptRepository = new ReceiptRepository(prisma);
      const receipt = await receiptRepository.create({
        user: {
          connect: {
            id: current_session.user.id,
          },
        },
        imagePath: uploaded_file.path,
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
}
