import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { redirectToSignIn } from "@clerk/nextjs"
import { redirect } from "next/navigation"

interface InviteCodePageProps {
    params:{
        inviteCode: string
    }
}

const InviteCodePage = async ({
    params
}: InviteCodePageProps)=>{
    const profile = await currentProfile()

    if(!profile){
        return redirectToSignIn()
    }

    if(!params.inviteCode){
        return redirect("/")
    }

    //see if the user already a member
    const existingServer = await db.server.findFirst({
        where:{
            inviteCode: params.inviteCode,
            members: {
                some: {
                    profileId: profile.id
                }
            }
        }
    })

    if(existingServer){
        return redirect(`/servers/${existingServer.id}`)
    }


    const server = await db.server.update({
        //update the server with the invite code
        where: {
            inviteCode: params.inviteCode,
        },
        //modify the data
        data: {
            //create member
            members: {
                create: [
                    {
                        profileId: profile.id
                        //no need to declare role bcus by default they're a guest
                    }
                ]
            }
        }
        
    })

    if(server){
        return redirect(`/servers/${server.id}`)
    }
    return null
}   

export default InviteCodePage