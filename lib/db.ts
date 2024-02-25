import { PrismaClient } from "@prisma/client";

declare global {
    var prisma: PrismaClient | undefined
}

export const db = globalThis.prisma || new PrismaClient() //in development, globalthis avoid initializing prisma too many times as its not affected by hot reload

if(process.env.NODE_ENV !== "production" ) globalThis.prisma = db