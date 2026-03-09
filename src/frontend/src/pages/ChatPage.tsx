import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Loader2, MessageSquare, Send, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { ChatMessage } from "../backend.d";
import { SignInPrompt } from "../components/SignInPrompt";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMessages, useSendMessage } from "../hooks/useQueries";
import { formatNanoTime, intentMeta, truncate } from "../utils/format";

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const meta = intentMeta(msg.intent);
  const time = formatNanoTime(msg.timestamp);
  const principal = msg.userId.toString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex gap-3 group"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 border border-primary/30 mt-0.5">
        <User className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-muted-foreground">
            {truncate(principal)}
          </span>
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 border ${meta.color}`}
          >
            {meta.label}
          </Badge>
          <span className="text-[10px] text-muted-foreground/60">{time}</span>
        </div>
        <div className="rounded-lg bg-secondary/60 border border-border px-3 py-2.5 text-sm text-foreground leading-relaxed">
          {msg.content}
        </div>
      </div>
    </motion.div>
  );
}

function BotResponse({ msg }: { msg: ChatMessage }) {
  const meta = intentMeta(msg.intent);
  const time = formatNanoTime(msg.timestamp);

  const RESPONSES: Record<string, string> = {
    hotel:
      "I've detected a hotel booking intent. Routing to the Hotel Automation module — I'll handle reservations, availability, and confirmations.",
    food: "Food order detected! Sending to the Food Automation pipeline for restaurant coordination and delivery tracking.",
    finance:
      "Financial transaction intent identified. Initiating secure Finance module processing with audit logging.",
    ticket:
      "Ticket request captured. The Ticket Automation engine will handle assignment, tracking, and resolution.",
    unknown:
      "Message received and logged. Intent classification is being refined — task queued for manual review.",
  };

  const intentKey = String(msg.intent);
  const reply = RESPONSES[intentKey] ?? RESPONSES.unknown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      className="flex gap-3"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 border border-accent/30 mt-0.5">
        <Bot className="h-3.5 w-3.5 text-accent" />
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-accent font-medium">AI Engine</span>
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 border ${meta.color}`}
          >
            → {meta.label}
          </Badge>
          <span className="text-[10px] text-muted-foreground/60">{time}</span>
        </div>
        <div className="rounded-lg bg-accent/5 border border-accent/20 px-3 py-2.5 text-sm text-foreground/90 leading-relaxed">
          {reply}
        </div>
      </div>
    </motion.div>
  );
}

export function ChatPage() {
  const { identity } = useInternetIdentity();
  const [input, setInput] = useState("");
  const { data: messages, isLoading } = useMessages();
  const sendMessage = useSendMessage();
  const bottomRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when message list changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!identity) {
    return (
      <SignInPrompt
        icon={MessageSquare}
        title="Sign In to Chat"
        description="Send messages to the AI chatbot. It detects hotel, food, finance, and ticket intents and routes them to the automation engine automatically."
      />
    );
  }

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    try {
      await sendMessage.mutateAsync(text);
    } catch {
      toast.error("Failed to send message");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full" data-ocid="chat.section">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div>
          <h1 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            AI Chatbot
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            NLP intent detection &amp; automation routing
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
          <span className="text-xs text-emerald-400 font-medium">Online</span>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-5 max-w-3xl mx-auto">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders have no identity
              <div key={i} className="flex gap-3">
                <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-12 w-full max-w-md" />
                </div>
              </div>
            ))
          ) : messages && messages.length > 0 ? (
            messages.map((msg) => (
              <div key={msg.id.toString()} className="space-y-3">
                <MessageBubble msg={msg} />
                <BotResponse msg={msg} />
              </div>
            ))
          ) : (
            <div
              className="flex flex-col items-center justify-center py-16 text-center"
              data-ocid="chat.empty_state"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/30 mb-4">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Ready to process your requests
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Try: "Book a hotel room in Mumbai" or "Pay invoice #1042"
              </p>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="shrink-0 border-t border-border bg-background/80 backdrop-blur-sm px-4 py-3">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Input
            data-ocid="chat.input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… e.g. 'Book hotel in Delhi for 3 nights'"
            className="flex-1 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            disabled={sendMessage.isPending}
          />
          <Button
            data-ocid="chat.submit_button"
            onClick={() => void handleSend()}
            disabled={sendMessage.isPending || !input.trim()}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {sendMessage.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
