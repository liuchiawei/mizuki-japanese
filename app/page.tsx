"use client";

/**
 * ホームページ
 * 老師紹介と予約ページへのナビゲーション
 */

import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Hero from "@/components/layout/hero";
import Container from "@/components/layout/container";
import ScrollTopDown from "@/components/widget/scroll-top-down";
import {
  Calendar,
  Clock,
  BookOpen,
  Star,
  MessageCircle,
  GraduationCap,
} from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Container>
        {/* 特徴セクション */}
        <section id="about" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-serif font-bold mb-4">
                為什麼選擇 Mizuki 老師？
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                專業、耐心、有系統的教學方式，讓您的日語學習之路更加順暢
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: GraduationCap,
                  title: "專業認證",
                  description: "日語教學相關證照，多年教學經驗",
                },
                {
                  icon: MessageCircle,
                  title: "一對一教學",
                  description: "針對您的程度和目標，客製化課程內容",
                },
                {
                  icon: Clock,
                  title: "彈性時間",
                  description: "線上授課，時間彈性安排，方便您的生活",
                },
                {
                  icon: Star,
                  title: "高滿意度",
                  description: "學生好評推薦，教學品質有保證",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 課程セクション */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-serif font-bold mb-4">課程內容</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                從初學者到進階者，都能找到適合自己的課程
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                {
                  level: "初級",
                  emoji: "🌱",
                  topics: ["五十音入門", "基礎文法", "日常會話", "自我介紹"],
                  color: "from-green-500/10 to-emerald-500/10",
                },
                {
                  level: "中級",
                  emoji: "🌿",
                  topics: ["進階文法", "JLPT N3-N2", "閱讀理解", "聽力訓練"],
                  color: "from-blue-500/10 to-cyan-500/10",
                },
                {
                  level: "高級",
                  emoji: "🌳",
                  topics: ["商務日語", "JLPT N1", "敬語表達", "文化深度"],
                  color: "from-purple-500/10 to-pink-500/10",
                },
              ].map((course, index) => (
                <motion.div
                  key={course.level}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                >
                  <Card
                    className={`h-full bg-gradient-to-br ${course.color} border-0 hover:shadow-lg transition-shadow`}
                  >
                    <CardContent className="pt-6">
                      <div className="text-4xl mb-4 text-center">
                        {course.emoji}
                      </div>
                      <h3 className="text-xl font-semibold text-center mb-4">
                        {course.level}
                      </h3>
                      <ul className="space-y-2">
                        {course.topics.map((topic) => (
                          <li
                            key={topic}
                            className="flex items-center gap-2 text-sm"
                          >
                            <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 課程資訊 */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <Card className="overflow-hidden">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-serif font-bold text-center mb-8">
                    課程資訊
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">上課時間</h3>
                        <p className="text-sm text-muted-foreground">
                          每堂課 50 分鐘
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">上課方式</h3>
                        <p className="text-sm text-muted-foreground">
                          Google Meet 線上視訊
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">預約方式</h3>
                        <p className="text-sm text-muted-foreground">
                          線上自助預約，24小時皆可
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Star className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">課後服務</h3>
                        <p className="text-sm text-muted-foreground">
                          提供講義與課後練習
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <Button asChild size="lg">
                      <Link href="/booking">
                        <Calendar className="mr-2 h-5 w-5" />
                        立即預約課程
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </Container>
      <ScrollTopDown />
    </>
  );
}
