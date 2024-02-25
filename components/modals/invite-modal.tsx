"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useModal } from "@/hooks/use-modal-store";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Check, Copy, RefreshCw } from "lucide-react";
import { useOrigin } from "@/hooks/use-origin";
import { useState } from "react";
import axios from "axios";

export const InviteModal = () => {
  const { onOpen ,isOpen, onClose, type, data } = useModal();
  const origin = useOrigin()

  const { server } = data
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isModalOpen = isOpen && type === "invite";

  //copy invite link
  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)

    //enable copy 2 sec after prev copy
    setTimeout(()=>{
      setCopied(false)
    },2500)
  }

  //invite link 
  const inviteUrl = `${origin}/invite/${server?.inviteCode}`

  const onNewLink = async() => {
    try {
      setIsLoading(true)
      //getting new link from the api
      const response = await axios.patch(`/api/servers/${server?.id}/invite-code`)
      
      //will change the server state, inviteUrl will also updated bcus of the change
      onOpen("invite", { server: response.data })
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Invite friends
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Make your server livelier with more friends 
          </DialogDescription>
        </DialogHeader>
        <div className="p-6">
          <Label
            className="uppercase text-xs font-bold
            text-zinc-500 dark:text-secondary/70"
          >
            Server invite link
          </Label>
          <div className="flex items-center mt-2 gap-x-2">
            <Input
              disabled={isLoading}
              className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
              value={inviteUrl}
            />
            <Button 
            disabled={isLoading}
            onClick={onCopy}
            size="icon">
              {copied ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
            </Button>
          </div>
          <Button
            onClick={onNewLink}
            disabled={isLoading}
            variant="link"
            size="sm"
            className="text-xs text-zinc-500 mt-4"
          >
            Generate new link
            <RefreshCw className="w-4 h-4 ml-2"/>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
