"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, User, Calendar, Save } from "lucide-react";

export default function CompleteProfilePage() {
    const { t, language } = useLanguage();
    const { user, loading: authLoading } = useAuth(); // We can reload user context after update if needed
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push(`/${language}/profile`);
        }
    }, [authLoading, user]);

    const [form, setForm] = useState({
        lastName: user?.lastName || "",
        firstName: user?.firstName || "",
        dateOfBirth: user?.dateOfBirth || "",
        zodiacYear: user?.zodiacYear || "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const ZODIAC_SIGNS = [
        { en: "Rat", mn: "Хулгана" },
        { en: "Ox", mn: "Үхэр" },
        { en: "Tiger", mn: "Бар" },
        { en: "Rabbit", mn: "Туулай" },
        { en: "Dragon", mn: "Луу" },
        { en: "Snake", mn: "Могой" },
        { en: "Horse", mn: "Морь" },
        { en: "Goat", mn: "Хонь" },
        { en: "Monkey", mn: "Бич" },
        { en: "Rooster", mn: "Тахиа" },
        { en: "Dog", mn: "Нохой" },
        { en: "Pig", mn: "Гахай" },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/users/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to update profile");
            }

            // Success
            // Ideally we should force a reload of the Auth Context here, 
            // but a redirect to dashboard usually triggers a re-fetch in dashboard's useEffect

            // Force reload the window to ensure context is fresh or just push
            window.location.href = "/dashboard";

        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const content = {
        title: t({ mn: "Мэдээллээ гүйцээнэ үү", en: "Final Step" }),
        subtitle: t({ mn: "Үйлчилгээ авахын тулд дараах мэдээллийг оруулна уу", en: "Please complete your profile to continue" }),
        lastName: t({ mn: "Овог", en: "Last Name" }),
        firstName: t({ mn: "Нэр", en: "First Name" }),
        dob: t({ mn: "Төрсөн огноо", en: "Date of Birth" }),
        save: t({ mn: "Хадгалах", en: "Save & Continue" }),
    };

    return (
        <div className="min-h-screen w-full bg-[#FFFBEB] font-sans flex flex-col justify-center py-12 sm:px-6 lg:px-8">

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
                <h2 className="text-3xl font-extrabold text-stone-900 font-serif">
                    {content.title}
                </h2>
                <p className="mt-2 text-sm text-stone-600">
                    {content.subtitle}
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-stone-100">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Last Name */}
                        <div>
                            <label className="block text-sm font-bold text-stone-700 mb-1">
                                {content.lastName}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-stone-400" />
                                </div>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={form.lastName}
                                    onChange={handleChange}
                                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-stone-300 rounded-lg shadow-sm placeholder-stone-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                    required
                                />
                            </div>
                        </div>

                        {/* First Name */}
                        <div>
                            <label className="block text-sm font-bold text-stone-700 mb-1">
                                {content.firstName}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-stone-400" />
                                </div>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={form.firstName}
                                    onChange={handleChange}
                                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-stone-300 rounded-lg shadow-sm placeholder-stone-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                    required
                                />
                            </div>
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className="block text-sm font-bold text-stone-700 mb-1">
                                {content.dob}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Calendar className="h-5 w-5 text-stone-400" />
                                </div>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={form.dateOfBirth}
                                    onChange={handleChange}
                                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-stone-300 rounded-lg shadow-sm placeholder-stone-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                    required
                                />
                            </div>
                        </div>

                        {/* Zodiac Year */}
                        <div>
                            <label className="block text-sm font-bold text-stone-700 mb-1">
                                {t({ mn: "Жил", en: "Zodiac Year" })}
                            </label>
                            <div className="relative">
                                <select
                                    name="zodiacYear"
                                    value={form.zodiacYear}
                                    onChange={handleSelectChange} // Use distinct handler if needed or cast event
                                    className="block w-full pl-3 pr-10 py-3 border border-stone-300 rounded-lg shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm appearance-none bg-white"
                                    required
                                >
                                    <option value="" disabled>{t({ mn: "Жил сонгох", en: "Select your Year" })}</option>
                                    {ZODIAC_SIGNS.map((sign) => (
                                        <option key={sign.en} value={sign.en}>
                                            {t({ mn: sign.mn, en: sign.en })}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-stone-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 disabled:opacity-50 transition-all uppercase tracking-widest"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : content.save}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
