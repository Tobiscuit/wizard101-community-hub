"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Bot, User } from "lucide-react"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function ScribePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Greetings, young Wizard. I am Gamma, the Scribe of the Spiral. What knowledge do you seek today?",
    },
  ])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return
    const newMsg: Message = { id: Date.now().toString(), role: "user", content: input }
    setMessages((prev) => [...prev, newMsg])
    setInput("")
    
    // Mock response for now
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: "I am currently disconnected from the Oracle (Ollama), but my ears are open." },
      ])
    }, 1000)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-2rem)] max-w-4xl mx-auto p-4 gap-4">
      {/* Header */}
      <div className="flex items-center gap-4 border-b pb-4">
        <Avatar className="h-12 w-12 border-2 border-primary/20">
          <AvatarImage src="/images/gamma-avatar.png" alt="Gamma" />
          <AvatarFallback><Bot className="h-6 w-6" /></AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            The Scribe
          </h1>
          <p className="text-sm text-muted-foreground">Powered by Gamma (Gemini 3.0)</p>
        </div>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 overflow-hidden bg-muted/50 border-none relative">
        <ScrollArea className="h-full p-4">
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <Avatar className="h-8 w-8 mt-1 border border-border">
                  {msg.role === "assistant" ? (
                    <AvatarFallback className="bg-primary/10"><Bot className="h-4 w-4 text-primary" /></AvatarFallback>
                  ) : (
                    <AvatarFallback className="bg-secondary"><User className="h-4 w-4" /></AvatarFallback>
                  )}
                </Avatar>
                <div
                  className={`rounded-2xl px-4 py-2 max-w-[80%] text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-background border border-border/50 rounded-tl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Input Area */}
      <div className="flex gap-2">
        <Input
          placeholder="Ask about drop rates, reagents, or lore..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 bg-background/80 backdrop-blur"
        />
        <Button onClick={handleSend} size="icon" className="shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
