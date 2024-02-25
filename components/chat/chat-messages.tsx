"use client"

import { Member, Message, Profile } from "@prisma/client"
import { ChatWelcome } from "./chat-welcome"
import { useChatQuery } from "@/hooks/use-chat-query"
import { Loader2, ServerCrash } from "lucide-react"
import { Fragment, ElementRef, useRef } from "react"
import { ChatItem } from "./chat-item"
import { format } from 'date-fns'
import { useChatSocket } from "@/hooks/use-chat-socket"
import { useChatScroll } from "@/hooks/use-chat-scroll"

type MessageWithMemberWithProfile = Message & {
    member: Member & { profile: Profile }
}

interface ChatMessagesProps {
    name: string
    member: Member
    chatId: string
    apiUrl: string
    socketUrl: string
    socketQuery: Record<string, string>
    paramKey: "channelId" | "conversationId"
    paramValue: string
    type: "channel" | "conversation"
}

const DATE_FORMAT = "d MMM yyyy, HH:mm"

export const ChatMessages = ({
    name,
    member,
    chatId,
    apiUrl,
    socketUrl,
    socketQuery,
    paramKey,
    paramValue,
    type
}: ChatMessagesProps) =>{
    const queryKey = `chat:${chatId}`
    const addKey = `chat:${chatId}:messages`
    const updateKey = `chat:${chatId}:messages:update`

    const chatRef = useRef<ElementRef<"div">>(null)
    const bottomRef = useRef<ElementRef<"div">>(null)

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status
    } = useChatQuery({
        queryKey,
        apiUrl,
        paramKey,
        paramValue
    })

    // provide real time updates! 
    useChatSocket({ queryKey, addKey, updateKey })
    useChatScroll({
        chatRef,
        bottomRef,
        loadMore: fetchNextPage,
        shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
        count: data?.pages?.[0]?.items?.length ?? 0
    })

    if(status === "pending"){
        return(
            <div className="flex flex-col flex-1 justiy-center items-center">
                <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4"/>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Loading messages...
                </p>
            </div>
        )
    }
    if(status === "error"){
        return(
            <div className="flex flex-col flex-1 justiy-center items-center">
                <ServerCrash className="h-7 w-7 text-zinc-500 my-4"/>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    OOps... Something went wrong!
                </p>
            </div>
        )
    }

    return (
        <div ref={chatRef} className="flex flex-1 flex-col py-4 overflow-y-auto">
            {!hasNextPage && (
                <>
                <div className="flex-1" />
                <ChatWelcome 
                    type={type}
                    name={name}
                />
                </>
            )}
            {isFetchingNextPage ? (
                <Loader2 className="h-6 w-6 text-zinc-500 animate-spin my-4" />
            ) : hasNextPage? (
                <button
                    onClick={() => fetchNextPage()}
                    className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 text-xs my-4 dark:hover:text-zinc-300 transition"
                >
                    Load previous message
                </button>
            ): null}
                <div className="flex flex-col-reverse mt-auto">
                    {data?.pages?.map((group, i)=>(
                        <Fragment key={i}>
                            {group.items.map((message: MessageWithMemberWithProfile)=>(
                                <ChatItem 
                                    key={message.id}
                                    id={message.id}
                                    currentMember={member}
                                    content={message.content}
                                    fileUrl={message.fileUrl}
                                    deleted={message.deleted}
                                    timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
                                    isUpdated={message.updatedAt  !== message.createdAt}
                                    socketUrl={socketUrl}
                                    socketQuery={socketQuery}
                                    member={message.member}
                                />
                            ))}
                        </Fragment>
                    ))}
                </div>
                <div ref={bottomRef}/>
        </div>
    )
}