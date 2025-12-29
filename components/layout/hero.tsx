"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Sparkles, ChevronRight } from "lucide-react";
import messages from "@/message/messages_temp.json";

export default function Hero() {
  return (
    <section className="relative pt-16 min-h-svh flex items-center overflow-hidden japanese-pattern">
      {/* 背景装飾 */}
      <div className="absolute inset-0 bg-gradient-to-b from-sakura-light/50 via-transparent to-background" />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* 左側：テキスト */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-6"
            >
              <Sparkles className="h-4 w-4" />
              {messages.hero.subtitle}
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
              和 <span className="text-primary">Mizuki</span> 老師
              <br />
              一起學日語
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              {messages.hero.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="text-base">
                <Link href="/booking">
                  <Calendar className="mr-2 h-5 w-5" />
                  {messages.hero.links.booking}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link href="#about">
                  {messages.hero.links.about}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* 右側：老師イメージ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative mx-auto w-72 h-72 sm:w-96 sm:h-96">
              {/* 装飾円 */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse" />
              <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-sakura/30 to-matcha/30" />

              {/* 中央のアイコン */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-8xl sm:text-9xl">👩‍🏫</div>
              </div>

              {/* 浮動装飾 */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-8 right-8 text-4xl"
              >
                🌸
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                className="absolute bottom-16 left-4 text-3xl"
              >
                📚
              </motion.div>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                className="absolute top-1/2 right-0 text-2xl"
              >
                ✨
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
