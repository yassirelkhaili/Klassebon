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

export const abonnementsRouter = router({
    /**
     * Testen mit: http://localhost:3000/api/trpc/abonnements.list?batch=1&input={}
     * Method: GET
     */
    list: protectedProcedure.query(({ ctx }) =>
        ctx.prisma.abonnement.findMany({
            where: { userId: ctx.user.id },
            orderBy: { naechsteFaelligkeit: "asc" },
        }),
    ),

    /**
     * Testen mit: http://localhost:3000/api/trpc/abonnements.getById?batch=1&input={"0":{"id":"<GESUCHTE ID>"}}
     * Method: GET
     */
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

    /**
     * Testen mit: http://localhost:3000/api/trpc/abonnements.create?batch=1
     * Method: POST
     * Headers: Authorization: Bearer <token>
     * Example Body (JSON):
     * 
        {
            "0": {
                "name": "Netflix",
                "betrag": 12.99,
                "turnus": "MONATLICH",
                "startDatum": "2026-01-01T00:00:00Z",
                "naechsteFaelligkeit": "2026-04-01T00:00:00Z"
            }
        }
     */
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

    /**
     * Testen mit: http://localhost:3000/api/trpc/abonnements.update?batch=1
     * Method: POST
     * Headers: Authorization: Bearer <token>
     * Example Body (JSON):
        {
            "0": {
                "id": "<ID DIE WIR UPDATEN WOLLEN>",
                "betrag": 15.99,
                "aktiv": false
            }
        }
     */
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

    /**
     * Testen mit: http://localhost:3000/api/trpc/abonnements.delete?batch=1
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
            const existing = await ctx.prisma.abonnement.findUnique({
                where: { id: input.id },
            });
            if (!existing || existing.userId !== ctx.user.id) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }
            return ctx.prisma.abonnement.delete({ where: { id: input.id } });
        }),
});
