"use client"

import { useState, useRef, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Bot, User, Sparkles, Moon } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { chatWithGamma, ChatMessage } from "@/app/actions/scribe"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

import { useTheme } from "next-themes"

export function ScribeWidget() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark" || resolvedTheme === "abyss"

  // TODO: connect to NEXT_PUBLIC_HIBERNATE_MODE if needed
  const isHibernate = false; 

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Greetings! I am Gamma, utilizing the latest Gemini 3.0 connection to the Spiral's archives. Ask me anything about stats, drops, or cheats!",
    },
  ])
  const [input, setInput] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll to bottom
    // Auto-scroll to bottom with small delay to ensure DOM render
    if (scrollRef.current) {
        setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" })
        }, 100);
    }
  }, [messages, isLoading])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    try {
        // Call Server Action
        // We pass the history (excluding IDs)
        const history: ChatMessage[] = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
        
        const responseCtx = await chatWithGamma(history);
        
        const botMsg: Message = { 
            id: (Date.now() + 1).toString(), 
            role: "assistant", 
            content: responseCtx.content 
        }
        
        setMessages((prev) => [...prev, botMsg])
    } catch (err) {
        console.error("Scribe Error:", err)
    } finally {
        setIsLoading(false)
    }
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
            {isHibernate && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 text-[8px] items-center justify-center text-white"><Moon className="w-2 h-2"/></span>
                </span>
            )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[540px] flex flex-col p-0 gap-0 border-l-accent-gold/20 h-[100dvh]">
        <SheetHeader className="p-6 border-b bg-muted/20">
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-accent-gold/30">
                    <AvatarImage src="/images/gamma-avatar.png" />
                    <AvatarFallback><Bot className="h-5 w-5 text-accent-gold" /></AvatarFallback>
                </Avatar>
                <div className="text-left">
                    <SheetTitle className="text-accent-gold flex items-center gap-2">
                        The Scribe
                        {isHibernate && <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full border border-blue-500/20">Hibernate Mode</span>}
                    </SheetTitle>
                    <SheetDescription className="text-xs">
                        {isHibernate ? "Model: Gemini 3.0 Flash (Backup Link)" : "Model: Gemini 3.0 Flash (Wizard's Knowledge)"}
                    </SheetDescription>
                </div>
            </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-6 relative scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
             <div className="flex flex-col gap-4 pb-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Assistant Avatar (Left) */}
                {msg.role === "assistant" && (
                    <Avatar className="h-8 w-8 mt-1 border border-border shrink-0">
                        <AvatarFallback className="bg-primary/10"><Bot className="h-4 w-4 text-primary" /></AvatarFallback>
                    </Avatar>
                )}

                {/* Message Bubble */}
                <div
                  className={`rounded-lg p-3 text-sm max-w-[85%] prose prose-sm leading-relaxed break-words ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground prose-headings:text-primary-foreground prose-p:text-primary-foreground prose-strong:text-primary-foreground" 
                      : "bg-muted text-foreground"
                  } ${isDark ? "prose-invert" : ""}`}
                >
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                        table: ({node, ...props}) => (
                            <div className="overflow-x-auto my-4 rounded-lg border border-border/50 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                                <table className="w-full text-left text-sm" {...props} />
                            </div>
                        ),
                        thead: ({node, ...props}) => <thead className="bg-muted/50 text-muted-foreground font-medium" {...props} />,
                        th: ({node, ...props}) => <th className="px-3 py-2 border-b border-border/50" {...props} />,
                        td: ({node, ...props}) => <td className="px-3 py-2 border-b border-border/10 last:border-0" {...props} />,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {/* User Avatar (Right) */}
                {msg.role === "user" && (
                  <Avatar className="h-8 w-8 mt-1 border border-border shrink-0">
                    <AvatarFallback className="bg-muted"><User className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
                 <div className="flex gap-3 flex-row">
                    <Avatar className="h-8 w-8 mt-1 border border-border shrink-0">
                        <AvatarFallback className="bg-primary/10"><Bot className="h-4 w-4 text-primary" /></AvatarFallback>
                    </Avatar>
                    <div className="rounded-2xl px-4 py-2 bg-muted text-muted-foreground rounded-tl-none border border-border/50">
                        <span className="animate-pulse">Consulting the archives...</span>
                    </div>
                </div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>

        <div className="p-4 pb-safe border-t bg-background/50 backdrop-blur sticky bottom-0">
          <div className="flex gap-2 relative">
             <Input
                placeholder={isHibernate ? "Ask Gamma (Backup Link)..." : "Ask about reagents, drops, or cheats..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={isLoading}
                className="pr-12 bg-muted/50 border-accent-gold/20 focus-visible:ring-accent-gold/50"
             />
             <Button 
                onClick={handleSend} 
                size="icon" 
                disabled={isLoading}
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
