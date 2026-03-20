import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc.js";

const ausgabeCreateInput = z.object({
    titel: z.string().min(1),
    betrag: z.number().positive(),
    datum: z.string().datetime(),
    kategorie: z.string().optional(),
    beschreibung: z.string().optional(),
});

const ausgabeUpdateInput = ausgabeCreateInput.partial().extend({
    id: z.string(),
});

export const ausgabenRouter = router({

    list: protectedProcedure.query(({ ctx }) =>
        ctx.prisma.ausgabe.findMany({
            where: { userId: ctx.user.id },
            orderBy: { datum: "desc" },
        }),
    ),

    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const ausgabe = await ctx.prisma.ausgabe.findUnique({
                where: { id: input.id },
            });
            if (!ausgabe || ausgabe.userId !== ctx.user.id) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }
            return ausgabe;
        }),

    create: protectedProcedure
        .input(ausgabeCreateInput)
        .mutation(({ ctx, input }) =>
            ctx.prisma.ausgabe.create({
                data: {
                    ...input,
                    datum: new Date(input.datum),
                    userId: ctx.user.id,
                },
            }),
        ),

    update: protectedProcedure
        .input(ausgabeUpdateInput)
        .mutation(async ({ ctx, input }) => {
            const { id, datum, ...rest } = input;
            const existing = await ctx.prisma.ausgabe.findUnique({ where: { id } });
            if (!existing || existing.userId !== ctx.user.id) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }
            return ctx.prisma.ausgabe.update({
                where: { id },
                data: {
                    ...rest,
                    ...(datum !== undefined ? { datum: new Date(datum) } : {}),
                },
            });
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const existing = await ctx.prisma.ausgabe.findUnique({
                where: { id: input.id },
            });
            if (!existing || existing.userId !== ctx.user.id) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }
            return ctx.prisma.ausgabe.delete({ where: { id: input.id } });
        }),
});
