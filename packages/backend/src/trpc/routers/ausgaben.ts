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

/**
 * Um die Methoden zu testen, müssen wir eingeloggt sein, dafür:
 * 
 *  http://localhost:3000/api/auth/sign-in/email
 *  Method: POST
 *  Body (JSON):
        {
            "email": "test@test.de",
            "password": "test1234"
        }

    
 * Wir bekommen ein Token, den wir für die unteren requests einsetzen.
 */

export const ausgabenRouter = router({
    /**
     * Testen mit: http://localhost:3000/api/trpc/ausgaben.list?batch=1&input={} 
     * Method: GET
     */
    list: protectedProcedure.query(({ ctx }) =>
        ctx.prisma.ausgabe.findMany({
            where: { userId: ctx.user.id },
            orderBy: { datum: "desc" },
        }),
    ),

    /**
     * Testen mit: http://localhost:3000/api/trpc/ausgaben.getById?batch=1&input={"0":{"id":"<GESUCHTE ID>"}}
     * Method: GET
     */
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

    /**
     * Testen mit: http://localhost:3000/api/trpc/ausgaben.create?batch=1
     * Method: POST
     * Headers: Authorization: Bearer <token>
     * Example Body (JSON):
     * 

        {
            "0": {
                "titel": "Schulausflug",
                "betrag": 12.50,
                "datum": "2026-03-20T00:00:00Z"
            }
        }

     */
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

    /**
     * Testen mit: http://localhost:3000/api/trpc/ausgaben.update?batch=1
     * Method: POST
     * Headers: Authorization: Bearer <token>
     * Example Body (JSON):

        {
            "0": {
                "id": "<ID DIE WIR UPDATEN WOLLEN>",
                "titel": "Schulausflug geändert",
                "betrag": 15.00
            }
        }

     */
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


    /**
     * Testen mit: http://localhost:3000/api/trpc/ausgaben.delete?batch=1
     * Method: POST
     * Headers: Authorization: Bearer <token>
     * Example Body (JSON):

        {
            "0": {
                "id": "<ID DIE WIR LÖSCHEN MÖCHTEN>"
            }
        }

     */
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
