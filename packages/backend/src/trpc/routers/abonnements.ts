import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc.js";

const abonnementCreateInput = z.object({
    name: z.string().min(1),
    betrag: z.number().positive(),
    turnus: z.enum(["WOECHENTLICH", "MONATLICH", "JAEHRLICH"]),
    startDatum: z.string().datetime(),
    naechsteFaelligkeit: z.string().datetime(),
    kategorie: z.string().optional(),
    beschreibung: z.string().optional(),
});

const abonnementUpdateInput = abonnementCreateInput.partial().extend({
    id: z.string(),
    aktiv: z.boolean().optional(),
});

export const abonnementsRouter = router({
    list: protectedProcedure.query(({ ctx }) =>
        ctx.prisma.abonnement.findMany({
            where: { userId: ctx.user.id },
            orderBy: { naechsteFaelligkeit: "asc" },
        }),
    ),

    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const abo = await ctx.prisma.abonnement.findUnique({
                where: { id: input.id },
            });
            if (!abo || abo.userId !== ctx.user.id) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }
            return abo;
        }),

    create: protectedProcedure
        .input(abonnementCreateInput)
        .mutation(({ ctx, input }) =>
            ctx.prisma.abonnement.create({
                data: {
                    ...input,
                    startDatum: new Date(input.startDatum),
                    naechsteFaelligkeit: new Date(input.naechsteFaelligkeit),
                    userId: ctx.user.id,
                },
            }),
        ),

    update: protectedProcedure
        .input(abonnementUpdateInput)
        .mutation(async ({ ctx, input }) => {
            const { id, startDatum, naechsteFaelligkeit, ...rest } = input;
            const existing = await ctx.prisma.abonnement.findUnique({ where: { id } });
            if (!existing || existing.userId !== ctx.user.id) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }
            return ctx.prisma.abonnement.update({
                where: { id },
                data: {
                    ...rest,
                    ...(startDatum !== undefined ? { startDatum: new Date(startDatum) } : {}),
                    ...(naechsteFaelligkeit !== undefined
                        ? { naechsteFaelligkeit: new Date(naechsteFaelligkeit) }
                        : {}),
                },
            });
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const existing = await ctx.prisma.abonnement.findUnique({
                where: { id: input.id },
            });
            if (!existing || existing.userId !== ctx.user.id) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }
            return ctx.prisma.abonnement.delete({ where: { id: input.id } });
        }),
});
