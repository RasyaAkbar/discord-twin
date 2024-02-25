"use client"

import { cn } from "@/lib/utils"
import { ActionTooltip } from "../action-tooltip"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { useEffect, useState } from "react"

interface NavigationItemProps {
    id: string
    imageUrl: string
    name: string
}

export const NavigationItem = ({
    id,
    imageUrl,
    name,
}: NavigationItemProps) => {
    
    const params = useParams()
    const router = useRouter()

    
    const onClick = ()=>{
        router.push(`/servers/${id}`)
    }
    const [isMounted, setIsMounted] = useState(false)//thats why it used isMounted (ref: 2)

    useEffect(() => {
        setIsMounted(true)
    },[])

    if(!isMounted) return null
    return (
        <ActionTooltip
            label={name}
            side="right"
            align="center"
        >
            <button
                onClick={onClick}
                className="group relative flex items-center"
            >
                <div
                    className={cn(
                        "absoluto left-0 bg-primary rounded-r-full transition-all w-[4px]",
                        params?.serverId !== id && "group-hover:h-[20px]",
                        params?.serverId === id ? "h-[36px]" : "h-[8px]" 
                    )}/>
                <div className={cn(
                    "relative group flex mx-3 h-[48px] w-[48px] rounded-[32px] group-hover:rounded-[16px] transition-all overflow-hidden",
                    params?.serverId === id && "bg-primary/10 text-primary rounded-[16px]"
                )}>
                    <Image 
                        fill
                        src={imageUrl}
                        alt="Channel"
                    />
                </div>
            </button>
        </ActionTooltip>
    )
}