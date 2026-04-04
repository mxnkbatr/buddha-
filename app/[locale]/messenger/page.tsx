"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { Send, ArrowLeft, Search, MessageSquare, Loader2, User, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useRealtimeMessages } from "@/app/hooks/useRealtimeMessages";

interface Conversation {
  otherId: string;
  otherName: string;
  otherImage: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isMonk: boolean;
}

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  text: string;
  createdAt: string;
  read: boolean;
}

interface MonkUser {
  _id: string;
  name: { mn: string; en: string };
  image: string;
  title: { mn: string; en: string };
  isSpecial?: boolean;
}

export default function MessengerPage() {
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const monkIdFromUrl = searchParams.get("monkId");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allMonks, setAllMonks] = useState<MonkUser[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  
  // Replace static messages state with realtime websocket hook
  const { messages, setMessages, isConnected, isFallbackMode, sendMessage } = useRealtimeMessages(
    selectedConv?.otherId || null,
    user?._id || user?.id || null
  );

  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"chats" | "monks">("chats");
  const [searchQuery, setSearchQuery] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${language}/sign-in`);
    }
  }, [authLoading, user, router, language]);

  // Fetch Conversations
  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        
        if (monkIdFromUrl && !data.find((c: Conversation) => c.otherId === monkIdFromUrl)) {
           fetchMonkInfo(monkIdFromUrl);
        } else if (monkIdFromUrl) {
           const existing = data.find((c: Conversation) => c.otherId === monkIdFromUrl);
           if (existing) setSelectedConv(existing);
        }
      }
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch All Monks
  const fetchAllMonks = async () => {
    try {
      const res = await fetch("/api/monks");
      if (res.ok) {
        const data = await res.json();
        setAllMonks(data);
      }
    } catch (error) {
      console.error("Failed to fetch all monks", error);
    }
  };

  const fetchMonkInfo = async (id: string) => {
    try {
      const res = await fetch(`/api/monks/${id}`);
      if (res.ok) {
        const monkData = await res.json();
        const tempConv: Conversation = {
          otherId: id,
          otherName: monkData.name[language] || monkData.name.mn || monkData.name.en,
          otherImage: monkData.image || "/default-monk.jpg",
          lastMessage: "",
          lastMessageAt: new Date().toISOString(),
          unreadCount: 0,
          isMonk: true
        };
        setSelectedConv(tempConv);
      }
    } catch (error) {
      console.error("Failed to fetch monk info", error);
    }
  };

  // Fetch Messages for selected conversation
  const fetchMessages = async (otherId: string) => {
    setMessagesLoading(true);
    try {
      const res = await fetch(`/api/messages/${otherId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchAllMonks();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConv) {
      setMessages([]); // Clear previous conversation messages
      fetchMessages(selectedConv.otherId);
    }
  }, [selectedConv]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/messages/${selectedConv.otherId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newMessage })
      });

      if (res.ok) {
        const sentMsg = await res.json();
        
        // Push WS message for realtime broadcasting
        if (isConnected) {
          sendMessage(sentMsg.text);
        } else {
          setMessages([...messages, sentMsg]);
        }
        
        setNewMessage("");
        
        setConversations(prev => {
          const exists = prev.find(c => c.otherId === selectedConv.otherId);
          if (exists) {
            return prev.map(c => 
              c.otherId === selectedConv.otherId 
                ? { ...c, lastMessage: sentMsg.text, lastMessageAt: sentMsg.createdAt } 
                : c
            );
          } else {
            return [{
              otherId: selectedConv.otherId,
              otherName: selectedConv.otherName,
              otherImage: selectedConv.otherImage,
              lastMessage: sentMsg.text,
              lastMessageAt: sentMsg.createdAt,
              unreadCount: 0,
              isMonk: true
            }, ...prev];
          }
        });
      }
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setSending(false);
    }
  };

  const startChatWithMonk = (monk: MonkUser) => {
    const existingConv = conversations.find(c => c.otherId === monk._id);
    if (existingConv) {
      setSelectedConv(existingConv);
    } else {
      setSelectedConv({
        otherId: monk._id,
        otherName: monk.name[language] || monk.name.mn || monk.name.en,
        otherImage: monk.image || "/default-monk.jpg",
        lastMessage: "",
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
        isMonk: true
      });
    }
    setActiveTab("chats");
  };

  const filteredConversations = conversations.filter(c => 
    c.otherName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMonks = allMonks.filter(m => 
    (m.name[language] || m.name.mn || m.name.en).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || (loading && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-10 h-10 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  // --- COMPONENT: CONVERSATION LIST ---
  if (!selectedConv) return (
    <div className="min-h-[100svh] bg-cream flex flex-col">
      {/* Header */}
      <header className="px-6 bg-cream border-b border-stone/30 sticky top-0 z-20"
        style={{ paddingTop: "calc(var(--header-height-mobile) + env(safe-area-inset-top))", paddingBottom: 16 }}>
        <div className="flex items-center justify-between mb-5">
           <h1 className="text-[26px] font-black text-ink tracking-tight">
             {t({ mn: "Мессенжер", en: "Messages" })}
           </h1>
           <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-stone/50 flex items-center justify-center">
             <MessageSquare size={20} className="text-gold" />
           </div>
        </div>

        {/* Segmented Control */}
        <div className="relative flex p-1 bg-stone/40 rounded-2xl">
          <motion.div
             className="absolute inset-1 bg-white rounded-xl shadow-sm z-0"
             animate={{ x: activeTab === "chats" ? "0%" : "100%" }}
             initial={false}
             transition={{ type: "spring", stiffness: 400, damping: 35 }}
             style={{ width: "calc(50% - 4px)" }}
          />
          {(["chats", "monks"] as const).map(tab => (
            <button key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative z-10 flex-1 py-2 text-[13px] font-black transition-colors ${
                activeTab === tab ? "text-ink" : "text-earth/60"
              }`}
            >
              {tab === "chats" ? t({ mn: "Яриа", en: "Chats" }) : t({ mn: "Багш нар", en: "Monks" })}
            </button>
          ))}
        </div>
      </header>

      {/* Search */}
      <div className="px-6 py-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-earth/50 group-focus-within:text-gold transition-colors" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t({ mn: "Хайх...", en: "Search conversations..." })}
            className="w-full bg-stone/20 border-2 border-transparent focus:border-gold/10 focus:bg-white rounded-2xl py-3.5 pl-11 pr-4 text-[15px] text-ink placeholder:text-earth/40 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-2">
              {[1, 2, 3].map(i => <div key={i} className="h-20 skeleton rounded-[2rem]" />)}
            </motion.div>
          ) : activeTab === "chats" ? (
            filteredConversations.length === 0 ? (
              <motion.div key="no-chats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 px-10">
                <div className="w-20 h-20 rounded-[2.5rem] bg-stone/30 flex items-center justify-center mx-auto mb-6">
                  <Sparkles size={32} className="text-earth/40" />
                </div>
                <h3 className="text-lg font-black text-ink mb-2">
                  {t({ mn: "Одоогоор чат алга", en: "No messages yet" })}
                </h3>
                <p className="text-[14px] text-earth/60 leading-relaxed">
                  {t({ mn: "Өөрт тохирох багшийг сонгон харилцааг эхлүүлээрэй.", en: "Start a soulful conversation with one of our experienced guides." })}
                </p>
              </motion.div>
            ) : (
              <motion.div key="chats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
                {filteredConversations.map((conv, idx) => (
                  <button key={conv.otherId} onClick={() => setSelectedConv(conv)}
                    className="w-full flex items-center gap-4 py-4 border-b border-stone/20 text-left active:bg-stone/20 rounded-2xl px-2 transition-colors -mx-2">
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-[1.5rem] overflow-hidden border-2 border-white shadow-sm">
                        <Image src={conv.otherImage || "/default-monk.jpg"} alt={conv.otherName}
                          width={56} height={56} className="w-full h-full object-cover" />
                      </div>
                      {conv.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full bg-gold border-2 border-white flex items-center justify-center px-1">
                          <span className="text-[9px] font-black text-white">{conv.unreadCount}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-[15px] font-black text-ink truncate">{conv.otherName}</span>
                        <span className="text-[11px] font-bold text-earth/50 shrink-0 ml-2">
                          {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                        </span>
                      </div>
                      <p className="text-[13px] text-earth/70 truncate pr-4">
                        {conv.lastMessage || t({ mn: "Яриаг эхлүүлэх...", en: "Start the conversation..." })}
                      </p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )
          ) : (
            // Monks tab
            <motion.div key="monks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 pt-2">
              {filteredMonks.map(monk => (
                <button key={monk._id}
                  onClick={() => startChatWithMonk(monk)}
                  className="w-full flex items-center gap-4 p-4 bg-white border border-stone/40 hover:border-gold/20 rounded-3xl text-left active:scale-[0.98] transition-all shadow-sm">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-card">
                    <Image src={monk.image || "/default-monk.jpg"} alt={monk.name.mn || ""}
                      width={48} height={48} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[15px] font-black text-ink mb-0.5">{monk.name[language as 'mn' | 'en'] || monk.name.mn}</p>
                    <p className="text-[11px] font-bold text-gold uppercase tracking-widest opacity-80">{monk.title?.[language as 'mn' | 'en'] || monk.title?.mn}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  // --- COMPONENT: CHAT WINDOW ---
  return (
    <div className="min-h-[100svh] bg-cream flex flex-col">
      {/* Chat header */}
      <header className="px-4 bg-white/80 backdrop-blur-md border-b border-stone/30 flex items-center gap-3 sticky top-0 z-30"
        style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 10px)", paddingBottom: 12 }}>
        <button onClick={() => setSelectedConv(null)}
          className="w-10 h-10 rounded-full hover:bg-stone/30 flex items-center justify-center shrink-0 transition-colors">
          <ArrowLeft size={22} className="text-ink" />
        </button>
        <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-sm border border-stone/20">
           <Image src={selectedConv.otherImage || "/default-monk.jpg"} alt={selectedConv.otherName}
            width={40} height={40} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-[16px] font-black text-ink truncate leading-tight">{selectedConv.otherName}</p>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse transition-colors ${isConnected ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : isFallbackMode ? "bg-gold shadow-[0_0_8px_rgba(217,119,6,0.5)]" : "bg-live"}`} />
            <p className="text-[11px] font-black text-earth/60 uppercase tracking-widest">
              {isConnected 
                ? t({ mn: "Холбогдсон", en: "Connected" }) 
                : isFallbackMode
                  ? t({ mn: "Холбогдсон", en: "Connected" })
                  : t({ mn: "Холбогдож байна...", en: "Connecting..." })}
            </p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto px-5 pt-6 space-y-4"
        style={{ paddingBottom: "calc(var(--tab-bar-height, 83px) + var(--sab, 0px) + 100px)" }}
      >
        <AnimatePresence>
          {messagesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className={`h-12 skeleton rounded-[1.5rem] max-w-[65%] ${i % 2 === 0 ? "ml-auto" : ""}`} />)}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 px-10 text-center">
              <div className="w-20 h-20 rounded-[2.5rem] bg-stone/20 flex items-center justify-center mb-8 shadow-sm">
                <Sparkles size={32} className="text-gold/40" />
              </div>
              <p className="text-[14px] font-black text-earth/40 uppercase tracking-[0.2em] italic max-w-[200px] leading-relaxed">
                {t({ mn: "Бодол санаагаа хуваалцаарай", en: "A heart-to-heart dialogue" })}
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMine = msg.senderId === user?._id || msg.senderId === user?.id;
              return (
                <motion.div 
                  key={msg._id} 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] px-5 py-3 shadow-sm text-[15px] leading-[1.6] ${isMine
                    ? "bg-gradient-to-br from-gold to-[#D97706] text-white rounded-[1.6rem] rounded-tr-[0.4rem]"
                    : "bg-white border border-stone/40 text-ink rounded-[1.6rem] rounded-tl-[0.4rem]"
                    }`}>
                    {msg.text}
                    <div className={`text-[9px] mt-1.5 font-bold uppercase tracking-widest ${isMine ? "text-white/60" : "text-earth/50"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* PREMIUM FLOATING INPUT BAR */}
      <div 
        className="fixed left-0 right-0 px-5 z-40"
        style={{ bottom: "calc(var(--tab-bar-height, 83px) + var(--sab, 0px) + 12px)" }}
      >
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/95 backdrop-blur-xl border border-stone/30 shadow-[0_8px_32px_rgba(120,104,81,0.12)] rounded-[2.5rem] p-1.5 flex items-center gap-2"
        >
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSendMessage(e as any)}
            placeholder={t({ mn: "Зурвас бичих...", en: "Write your thoughts..." })}
            className="flex-1 bg-transparent py-4 px-6 text-[15px] text-ink placeholder:text-earth/40 outline-none"
          />
          <button
            type="submit"
            onClick={(e) => handleSendMessage(e as any)}
            disabled={sending || !newMessage.trim()}
            className="w-12 h-12 rounded-full bg-gold flex items-center justify-center shrink-0 disabled:opacity-30 active:scale-90 transition-all shadow-gold cursor-pointer"
          >
            {sending ? <Loader2 size={20} className="text-white animate-spin" /> : <Send size={20} className="text-white" />}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
