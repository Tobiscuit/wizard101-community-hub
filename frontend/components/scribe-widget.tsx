"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Bot, User, Sparkles } from "lucide-react"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

export function ScribeWidget() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Greetings! I am Gamma, the Scribe. I can verify outdated wiki info using my bleeding-edge connection to the Spiral. How can I help?",
    },
  ])
  const [input, setInput] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleSend = () => {
    if (!input.trim()) return
    const newMsg: Message = { id: Date.now().toString(), role: "user", content: input }
    setMessages((prev) => [...prev, newMsg])
    setInput("")
    
    // Mock response for now
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: "I am listening. (Logic to be wired to Gemini API)." },
      ])
    }, 1000)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl border-accent-gold/50 bg-background/80 backdrop-blur hover:bg-accent-gold/10 hover:border-accent-gold transition-all duration-300 z-50 group"
        >
            <div className="absolute inset-0 rounded-full border border-accent-gold/20 animate-ping opacity-20 group-hover:opacity-40" />
            <Bot className="h-6 w-6 text-accent-gold" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] flex flex-col p-0 gap-0 border-l-accent-gold/20">
        <SheetHeader className="p-6 border-b bg-muted/20">
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-accent-gold/30">
                    <AvatarImage src="/images/gamma-avatar.png" />
                    <AvatarFallback><Bot className="h-5 w-5 text-accent-gold" /></AvatarFallback>
                </Avatar>
                <div className="text-left">
                    <SheetTitle className="text-accent-gold">The Scribe</SheetTitle>
                    <SheetDescription className="text-xs">Powered by Gamma (Gemini 3.0)</SheetDescription>
                </div>
            </div>
        </SheetHeader>
        
        <ScrollArea className="flex-1 p-6 relative">
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
                  className={`rounded-2xl px-4 py-2 max-w-[85%] text-sm shadow-sm ${
                    msg.role === "user"
                      ? "bg-accent-gold text-primary-foreground rounded-tr-none"
                      : "bg-muted text-muted-foreground rounded-tl-none border border-border/50"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-background/50 backdrop-blur">
          <div className="flex gap-2 relative">
             <Input
                placeholder="Ask about reagents, drops, or cheats..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="pr-12 bg-muted/50 border-accent-gold/20 focus-visible:ring-accent-gold/50"
             />
             <Button 
                onClick={handleSend} 
                size="icon" 
                className="absolute right-1 top-1 h-8 w-8 bg-accent-gold text-white hover:bg-accent-gold/90"
             >
                <Send className="h-4 w-4" />
             </Button>
          </div>
          <div className="text-[10px] text-center text-muted-foreground mt-2 flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3 text-accent-gold" />
            <span>Grounded in Reality via Google Search</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
