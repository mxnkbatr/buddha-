"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Plus, Trash2 } from "lucide-react";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface MonkEditModalProps {
  monk: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: any) => Promise<void>;
}

export default function MonkEditModal({ monk, isOpen, onClose, onSave }: MonkEditModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "details" | "bio">("basic");

  useEffect(() => {
    if (monk) {
      // Initialize form with monk data, ensuring objects exist
      setFormData({
        ...monk,
        name: monk.name || { mn: "", en: "" },
        title: monk.title || { mn: "", en: "" },
        bio: monk.bio || { mn: "", en: "" },
        education: monk.education || { mn: "", en: "" },
        philosophy: monk.philosophy || { mn: "", en: "" },
        quote: monk.quote || { mn: "", en: "" },
        specialties: monk.specialties || [],
        yearsOfExperience: monk.yearsOfExperience || 0,
        image: monk.image || "",
      });
    }
  }, [monk]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: any, nestedField?: string) => {
    if (nestedField) {
      setFormData((prev: any) => ({
        ...prev,
        [field]: {
          ...prev[field],
          [nestedField]: value
        }
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [field]: value }));
    }
  };

  const handleSpecialtyChange = (index: number, value: string) => {
    const newSpecialties = [...formData.specialties];
    newSpecialties[index] = value;
    setFormData({ ...formData, specialties: newSpecialties });
  };

  const addSpecialty = () => {
    setFormData({ ...formData, specialties: [...formData.specialties, ""] });
  };

  const removeSpecialty = (index: number) => {
    const newSpecialties = formData.specialties.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, specialties: newSpecialties });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(monk._id, formData);
      onClose();
    } catch (error) {
      console.error("Failed to save monk", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0C164F] w-full max-w-4xl rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-white dark:bg-white/5">
          <div>
            <h2 className="text-2xl font-black font-serif text-amber-600 dark:text-amber-400">Лам засах</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Мэдээллийг шинэчлэх</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-white/10 px-6 bg-gray-50 dark:bg-black/20">
          {["basic", "details", "bio"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-4 px-6 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === tab
                ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-white/5"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
            >
              {{ basic: "Үндсэн", details: "Дэлгэрэнгүй", bio: "Намтар & Бусад" }[tab]}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <form id="monk-edit-form" onSubmit={handleSubmit} className="space-y-6">

            {/* BASIC INFO */}
            {activeTab === "basic" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Нэр (MN)" value={formData.name?.mn} onChange={(v: string) => handleChange("name", v, "mn")} />
                <InputGroup label="Name (EN)" value={formData.name?.en} onChange={(v: string) => handleChange("name", v, "en")} />

                <InputGroup label="Цол (MN)" value={formData.title?.mn} onChange={(v: string) => handleChange("title", v, "mn")} />
                <InputGroup label="Title (EN)" value={formData.title?.en} onChange={(v: string) => handleChange("title", v, "en")} />

                <div className="col-span-full">
                  <InputGroup label="Зураг (URL)" value={formData.image} onChange={(v: string) => handleChange("image", v)} />
                  {formData.image && (
                    <div className="relative w-20 h-20 mt-2">
                      <Image
                        src={formData.image}
                        alt="Preview"
                        fill
                        className="rounded-xl object-cover border-2 border-amber-500"
                        sizes="80px"
                      />
                    </div>
                  )}
                </div>

                <div className="col-span-full flex items-center gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                  <input
                    type="checkbox"
                    id="isSpecial"
                    checked={formData.isSpecial || false}
                    onChange={(e) => handleChange("isSpecial", e.target.checked)}
                    className="w-5 h-5 accent-amber-500"
                  />
                  <div>
                    <label htmlFor="isSpecial" className="font-bold text-sm text-amber-800 dark:text-amber-200 cursor-pointer select-none">Онцгой Лам (Special Status)</label>
                    <p className="text-xs opacity-60">Идэвхжүүлвэл үйлчилгээний үнэ 80k, орлого 80k болно.</p>
                  </div>
                </div>

                <div className="col-span-full">
                  <InputGroup label="Утас (Phone)" value={formData.phone} onChange={(v: string) => handleChange("phone", v)} />
                </div>
              </div>
            )}

            {/* DETAILS */}
            {activeTab === "details" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Туршлага (Жил)" type="number" value={formData.yearsOfExperience} onChange={(v: string) => handleChange("yearsOfExperience", parseInt(v) || 0)} />
                  <InputGroup label="Earnings (₮)" type="number" value={formData.earnings} onChange={(v: string) => handleChange("earnings", parseInt(v) || 0)} />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300">Мэргэшил (Specialties)</label>
                  <div className="flex flex-wrap gap-2">
                    {formData.specialties?.map((spec: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          className="bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500"
                          value={spec}
                          onChange={(e) => handleSpecialtyChange(index, e.target.value)}
                        />
                        <button type="button" onClick={() => removeSpecialty(index)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    ))}
                    <button type="button" onClick={addSpecialty} className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-500/10 px-4 py-2 rounded-lg hover:bg-amber-500/20 transition-colors border border-amber-500/20">
                      <Plus size={16} /> Нэмэх
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Боловсрол (MN)" value={formData.education?.mn} onChange={(v: string) => handleChange("education", v, "mn")} textarea />
                  <InputGroup label="Education (EN)" value={formData.education?.en} onChange={(v: string) => handleChange("education", v, "en")} textarea />
                </div>
              </div>
            )}

            {/* BIO & OTHERS */}
            {activeTab === "bio" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Намтар (MN)" value={formData.bio?.mn} onChange={(v: string) => handleChange("bio", v, "mn")} textarea rows={6} />
                  <InputGroup label="Biography (EN)" value={formData.bio?.en} onChange={(v: string) => handleChange("bio", v, "en")} textarea rows={6} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Философи (MN)" value={formData.philosophy?.mn} onChange={(v: string) => handleChange("philosophy", v, "mn")} textarea />
                  <InputGroup label="Philosophy (EN)" value={formData.philosophy?.en} onChange={(v: string) => handleChange("philosophy", v, "en")} textarea />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Ишлэл (MN)" value={formData.quote?.mn} onChange={(v: string) => handleChange("quote", v, "mn")} />
                  <InputGroup label="Quote (EN)" value={formData.quote?.en} onChange={(v: string) => handleChange("quote", v, "en")} />
                </div>
              </div>
            )}

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-white/10 flex justify-end gap-3 bg-gray-50/50 dark:bg-white/5">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-xs uppercase bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-white/60 hover:opacity-80 transition-opacity"
          >
            Болих
          </button>
          <button
            type="submit"
            form="monk-edit-form"
            disabled={loading}
            className="px-6 py-3 rounded-xl font-bold text-xs uppercase bg-amber-500 text-white shadow-lg shadow-amber-900/20 hover:bg-amber-600 transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Хадгалах
          </button>
        </div>

      </div>
    </div>
  );
}

function InputGroup({ label, value, onChange, type = "text", textarea = false, rows = 3 }: any) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300 block">{label}</label>
      {textarea ? (
        <textarea
          className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 transition-colors"
          rows={rows}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type={type}
          className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 transition-colors"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  )
}