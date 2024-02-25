import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { DirectMessage, Message } from "@prisma/client"
import { NextResponse } from "next/server"

const MESSAGES_BATCH = 10

export async function GET(
    req: Request
){
    try {
        const profile = await currentProfile()
        const { searchParams } = new URL(req.url)

        if(!profile){
            return new NextResponse("Unauthorized", { status: 401 })
        }

        //tell the infinite query to load next batch of messages needed to load (there are many method to do this, in this case using cursor)
        const cursor = searchParams.get("cursor")
        const conversationId = searchParams.get("conversationId")

        if(!conversationId){
            return new NextResponse("Channel ID missing", { status: 400 })
        }

        let messages: DirectMessage[] = []

        if(cursor){
            messages = await db.directMessage.findMany({
                take: MESSAGES_BATCH,
                skip: 1,
                cursor:{
                    id: cursor
                },
                where: {
                    conversationId
                },
                include:{
                    member:{
                        include:{
                            profile: true
                        }
                    }
                },
                orderBy:{
                    createdAt: "desc"
                }
            })
        } else{
            messages = await db.directMessage.findMany({
                take: MESSAGES_BATCH,
                where:{
                    conversationId
                },
                include:{
                    member:{
                        include:{
                            profile: true
                        }
                    }
                },
                orderBy:{
                    createdAt: "desc"
                }
            })
        }

        let nextCursor = null
        
        //create nextCursor for infinite query using the information of the currently fetch messages
        //if messages length is more than the messages_batch we have reach the end of the infinite query (no need to change the nextCursor)
        if(messages.length === MESSAGES_BATCH){
            nextCursor = messages[MESSAGES_BATCH - 1].id
        }

        return NextResponse.json({
            items: messages,
            nextCursor
        })
    } catch (error) {
        console.log("[DIRECT_MESSAGES_GET]", error)
        return new NextResponse("Internal error", { status: 500 })
    }
}