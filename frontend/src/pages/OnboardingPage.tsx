"use client";

import { useState } from "react";
import type { Specialization } from "@/types/types";
import { specializations } from "@/data/specialization";
import { SpecializationCard } from "@/components/specialization-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Footer from "@/components/footer";
import { Link } from "react-router";

interface OnboardingScreenProps {
  onComplete: (selectedSpecialization: Specialization) => void;
}

export function OnboardingPage({ onComplete }: OnboardingScreenProps) {
  const [selectedSpec, setSelectedSpec] = useState<Specialization | null>(null);

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Заголовок */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Планирование карьеры на основе ИИ
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
              Добро пожаловать в SkillSync
            </h1>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed">
              Ваш динамический планировщик степени магистра. Выберите карьеру мечты,
              и мы построим индивидуальный учебный путь, который адаптируется по мере вашего роста.
            </p>
          </div>

          {/* Как это работает */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Как работает SkillSync:</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="font-medium">Выберите цель</h3>
                <p className="text-sm text-muted-foreground">
                  Выберите карьерный путь, который вас больше всего вдохновляет
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="font-medium">Адаптивное планирование</h3>
                <p className="text-sm text-muted-foreground">
                  Получайте персональные рекомендации курсов каждый семестр
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="font-medium">Отслеживайте прогресс</h3>
                <p className="text-sm text-muted-foreground">
                  Наблюдайте за ростом ваших навыков и достигайте карьерных целей
                </p>
              </div>
            </div>
          </div>

          {/* Специализации */}
          <div className="space-y-4 mt-10">
            <h2 className="text-4xl font-bold text-center">
              Я хочу стать...
            </h2>
            <div className="">
              {specializations.map((spec) => (
                <SpecializationCard
                  key={spec.id}
                  specialization={spec}
                  isSelected={selectedSpec?.id === spec.id}
                  onClick={() => setSelectedSpec(spec)}
                />
              ))}
            </div>
          </div>

          {/* Кнопка продолжения */}
          {selectedSpec && (
            <div className="flex justify-center pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Link to={'/courses'}>
                <Button
                  size="lg"
                  onClick={() => onComplete(selectedSpec)}
                  className="gap-2 bg-blue-600 text-lg px-8"
                >
                  Начать мой путь как {selectedSpec.name}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}