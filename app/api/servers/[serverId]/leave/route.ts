import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PATCH(
    req: Request,
    { params }: { params: { serverId: string }}
){
    try {
        const profile = await currentProfile()
        if(!profile){
            return new NextResponse("Unauthorized", { status: 401 })
        }
        
        if (!params.serverId){
            return new NextResponse("Server ID Missing", { status: 400 })
        }
        const server = await db.server.update({
            where:{
                id: params.serverId,
                //admin cannot remove/leave themselves
                profileId: {
                    not: profile.id
                },
                //make sure the user who is leaving is part of the server
                members:{
                    some:{
                        profileId: profile.id
                    }
                }
            },
            data: {
                members:{
                    deleteMany:{
                        profileId: profile.id
                    }
                }
            }
        })

        return NextResponse.json(server)

    } catch (error) {
        console.log("[SERVER_ID_LEAVE]", error)
        return new NextResponse("Internal error", { status: 500 })
    }
}