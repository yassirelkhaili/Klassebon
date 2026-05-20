import type { PrismaClient, Receipt, Prisma } from "../generated/prisma/client.js";
import { NotFoundError, InternalServerError } from "../types/errors.js";

export class ReceiptRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: Prisma.ReceiptCreateInput): Promise<Receipt> {
    try {
      return await this.prisma.receipt.create({ data });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerError(`Failed to create receipt: ${message}`);
    }
  }

  async findById(id: string): Promise<Receipt> {
    const receipt = await this.prisma.receipt.findUnique({ where: { id } });
    if (!receipt) {
      throw new NotFoundError(`Receipt with ID ${id} not found`);
    }
    return receipt;
  }

  async findByUserId(userId: string): Promise<Receipt[]> {
    return this.prisma.receipt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findAll(skip = 0, take = 10): Promise<Receipt[]> {
    return this.prisma.receipt.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
  }

  // Throws NotFoundError if no receipt with this id (Prisma P2025).
  async update(id: string, data: Prisma.ReceiptUpdateInput): Promise<Receipt> {
    try {
      return await this.prisma.receipt.update({ where: { id }, data });
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") {
        throw new NotFoundError(`Receipt with ID ${id} not found`);
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerError(`Failed to update receipt: ${message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.receipt.delete({ where: { id } });
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") {
        throw new NotFoundError(`Receipt with ID ${id} not found`);
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerError(`Failed to delete receipt: ${message}`);
    }
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.receipt.count({ where: { id } });
    return count > 0;
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.receipt.count({ where: { userId } });
  }
}
