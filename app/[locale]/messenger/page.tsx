"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { Send, ArrowLeft, MoreVertical, Search, MessageSquare, Loader2, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

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
  const [messages, setMessages] = useState<Message[]>([]);
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
      fetchMessages(selectedConv.otherId);
      
      const interval = setInterval(() => {
        fetchMessages(selectedConv.otherId);
      }, 5000);
      
      return () => clearInterval(interval);
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
        setMessages([...messages, sentMsg]);
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
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <Loader2 className="animate-spin text-amber-600" size={40} />
      </div>
    );
  }

  if (!user) {
    return null; // Redirecting via useEffect
  }

  return (
    <div className="flex flex-col h-screen bg-[#fdfbf7] overflow-hidden">
      
      <div className="flex flex-1 pt-20 overflow-hidden relative">
        {/* Left Sidebar: Conversations List */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-amber-900/5 flex flex-col bg-white/50 backdrop-blur-xl ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-amber-900/5">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-serif font-black text-amber-900">Мессенжер</h1>
            </div>
            
            {/* Tabs Toggle */}
            <div className="flex p-1 bg-amber-900/5 rounded-xl mb-4">
              <button 
                onClick={() => setActiveTab("chats")}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'chats' ? 'bg-white text-amber-900 shadow-sm' : 'text-amber-900/40 hover:text-amber-900/60'}`}
              >
                {t({ mn: "Чат", en: "Chats" })}
              </button>
              <button 
                onClick={() => setActiveTab("monks")}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'monks' ? 'bg-white text-amber-900 shadow-sm' : 'text-amber-900/40 hover:text-amber-900/60'}`}
              >
                {t({ mn: "Бүх Лам нар", en: "All Monks" })}
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-900/30" size={18} />
              <input 
                type="text" 
                placeholder={t({ mn: "Хайх...", en: "Search..." })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-amber-900/5 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 ring-amber-500/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {activeTab === 'chats' ? (
              filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center opacity-40">
                  <MessageSquare size={48} className="mb-4" />
                  <p className="text-sm font-bold uppercase tracking-widest">{t({ mn: "Чат байхгүй байна", en: "No chats yet" })}</p>
                  <button onClick={() => setActiveTab("monks")} className="mt-4 text-[10px] text-amber-600 font-black hover:underline underline-offset-4">
                    {t({ mn: "ШИНЭ ЧАТ ЭХЛҮҮЛЭХ", en: "START NEW CHAT" })}
                  </button>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.otherId}
                    onClick={() => setSelectedConv(conv)}
                    className={`w-full p-4 flex items-center gap-4 transition-colors hover:bg-amber-900/5 border-b border-amber-900/5 ${selectedConv?.otherId === conv.otherId ? 'bg-amber-900/5' : ''}`}
                  >
                    <div className="relative shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500/20">
                      <Image src={conv.otherImage} alt={conv.otherName} fill className="object-cover" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className="font-bold text-amber-900 truncate">{conv.otherName}</h3>
                        <span className="text-[10px] text-amber-900/40">{new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs text-amber-900/60 truncate">{conv.lastMessage || t({ mn: "Шинэ чат эхлүүлэх...", en: "Start a new chat..." })}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center">
                        <span className="text-[10px] text-white font-bold">{conv.unreadCount}</span>
                      </div>
                    )}
                  </button>
                ))
              )
            ) : (
              filteredMonks.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center opacity-40">
                  <User size={48} className="mb-4" />
                  <p className="text-sm font-bold uppercase tracking-widest">{t({ mn: "Лам олдсонгүй", en: "No monks found" })}</p>
                </div>
              ) : (
                filteredMonks.map((monk) => (
                  <button
                    key={monk._id}
                    onClick={() => startChatWithMonk(monk)}
                    className="w-full p-4 flex items-center gap-4 transition-colors hover:bg-amber-900/5 border-b border-amber-900/5"
                  >
                    <div className="relative shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500/20">
                      <Image src={monk.image || "/default-monk.jpg"} alt={monk.name[language] || monk.name.mn} fill className="object-cover" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <h3 className="font-bold text-amber-900 truncate">{monk.name[language] || monk.name.mn}</h3>
                      <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest truncate">
                        {monk.title?.[language] || monk.title?.mn || t({ mn: "Багш", en: "Monk" })}
                      </p>
                    </div>
                    <MessageSquare size={16} className="text-amber-900/20" />
                  </button>
                ))
              )
            )}
          </div>
        </div>

        {/* Main Content: Chat Window */}
        <div className={`flex-1 flex flex-col bg-white/30 backdrop-blur-sm ${selectedConv ? 'flex' : 'hidden md:flex items-center justify-center'}`}>
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-amber-900/5 flex items-center justify-between bg-white/80">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedConv(null)} className="md:hidden p-2 -ml-2 text-amber-900/60">
                    <ArrowLeft size={20} />
                  </button>
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-500/20">
                    <Image src={selectedConv.otherImage} alt={selectedConv.otherName} width={40} height={40} className="object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-900 leading-none mb-1">{selectedConv.otherName}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 opacity-70">
                      {selectedConv.isMonk ? "Багш" : "Хэрэглэгч"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <button className="p-2 text-amber-900/40 hover:text-amber-900 transition-colors">
                     <MoreVertical size={20} />
                   </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-hide bg-[url('/noise.svg')] bg-repeat">
                {messagesLoading && messages.length === 0 ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-amber-600" size={24} />
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMe = msg.senderId === user?._id.toString();
                    return (
                      <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                          isMe 
                            ? 'bg-amber-600 text-white rounded-tr-none' 
                            : 'bg-white text-amber-900 rounded-tl-none border border-amber-900/5'
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          <span className={`text-[8px] mt-1 block opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-amber-900/5 bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Мессеж бичих..."
                    className="flex-1 bg-amber-900/5 border-none rounded-2xl py-3 px-6 text-sm outline-none focus:ring-2 ring-amber-500/20"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className={`p-3 rounded-2xl transition-all shadow-lg ${
                      newMessage.trim() && !sending 
                        ? 'bg-amber-600 text-white scale-100' 
                        : 'bg-amber-100 text-amber-300 scale-95'
                    }`}
                  >
                    {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center opacity-40">
              <div className="w-20 h-20 rounded-full bg-amber-900/5 flex items-center justify-center mb-6">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-xl font-serif font-bold text-amber-900 mb-2">Мессеж сонгоно уу</h3>
              <p className="text-sm font-medium uppercase tracking-widest max-w-xs">
                Зүүн талын жагсаалтаас хүн сонгож чатлаж эхэлнэ үү.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
