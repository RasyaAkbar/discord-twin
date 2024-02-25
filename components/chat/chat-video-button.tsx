"use client"

import qs from "query-string"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Video, VideoOff } from "lucide-react"
import { ActionTooltip } from "../action-tooltip"
import { useEffect, useState } from "react"

export const ChatVideoButton = () => {
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    const isVideo = searchParams?.get("video")
    const Icon = isVideo ? VideoOff : Video

    const onClick = () => {
        const url = qs.stringifyUrl({
            url: pathname || "",
            query: {
                video: isVideo? undefined : true
            }
        }, { skipNull: true })

        router.push(url)
    }

    const tooltipLabel = isVideo? "End video call": "Start video call"
    const [isMounted, setIsMounted] = useState(false); //thats why it used isMounted (ref: 2)

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <ActionTooltip side="bottom" label={tooltipLabel}>
            <button onClick={onClick} className="hover:opacity-75 transition mr-4">
                <Icon className="h-6 w-6 text-zinc-500 dark:text-zinc-400"/>
            </button>
        </ActionTooltip>
    )
}