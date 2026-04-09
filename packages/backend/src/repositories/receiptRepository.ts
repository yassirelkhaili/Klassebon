/**
 * @fileoverview Repository for receipt data access using Prisma ORM.
 * Handles all database operations for receipts.
 */

import type { PrismaClient, Receipt, Prisma } from "../generated/prisma/client.js";
import { NotFoundError, InternalServerError } from "../types/errors.js";

export class ReceiptRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Creates a new receipt in the database.
   * @param data - Receipt creation data
   * @returns Created receipt
   * @throws {InternalServerError} When database operation fails
   */
  async create(data: Prisma.ReceiptCreateInput): Promise<Receipt> {
    try {
      return await this.prisma.receipt.create({ data });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerError(`Failed to create receipt: ${message}`);
    }
  }

  /**
   * Finds a receipt by ID.
   * @param id - Receipt ID
   * @returns Receipt if found
   * @throws {NotFoundError} When receipt doesn't exist
   */
  async findById(id: string): Promise<Receipt> {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id },
    });

    if (!receipt) {
      throw new NotFoundError(`Receipt with ID ${id} not found`);
    }

    return receipt;
  }

  /**
   * Finds all receipts for a specific user.
   * @param userId - User ID
   * @returns Array of receipts
   */
  async findByUserId(userId: string): Promise<Receipt[]> {
    return await this.prisma.receipt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Finds all receipts with pagination.
   * @param skip - Number of records to skip
   * @param take - Number of records to take
   * @returns Array of receipts
   */
  async findAll(skip = 0, take = 10): Promise<Receipt[]> {
    return await this.prisma.receipt.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Updates a receipt by ID.
   * @param id - Receipt ID
   * @param data - Update data
   * @returns Updated receipt
   * @throws {NotFoundError} When receipt doesn't exist
   */
  async update(id: string, data: Prisma.ReceiptUpdateInput): Promise<Receipt> {
    try {
      return await this.prisma.receipt.update({
        where: { id },
        data,
      });
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2025"
      ) {
        throw new NotFoundError(`Receipt with ID ${id} not found`);
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerError(`Failed to update receipt: ${message}`);
    }
  }

  /**
   * Deletes a receipt by ID.
   * @param id - Receipt ID
   * @throws {NotFoundError} When receipt doesn't exist
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.receipt.delete({
        where: { id },
      });
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2025"
      ) {
        throw new NotFoundError(`Receipt with ID ${id} not found`);
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerError(`Failed to delete receipt: ${message}`);
    }
  }

  /**
   * Checks if a receipt exists.
   * @param id - Receipt ID
   * @returns True if receipt exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.receipt.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Counts total receipts for a user.
   * @param userId - User ID
   * @returns Total count
   */
  async countByUserId(userId: string): Promise<number> {
    return await this.prisma.receipt.count({
      where: { userId },
    });
  }
}
