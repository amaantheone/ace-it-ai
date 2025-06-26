"use client";

import React, { useEffect } from "react";
import {
  BookOpen,
  Brain,
  MessageSquare,
  FileQuestion,
  BarChart3,
  PieChart,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar
} from "recharts";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";

export default function Dashboard() {
  const { data: session } = useSession();

  // Mock data for analytics (replace with real data as needed)
  const weeklyData = [
    { day: "Mon", sessions: 4, mindmaps: 2, flashcards: 15, quizzes: 3 },
    { day: "Tue", sessions: 6, mindmaps: 1, flashcards: 22, quizzes: 5 },
    { day: "Wed", sessions: 3, mindmaps: 3, flashcards: 18, quizzes: 2 },
    { day: "Thu", sessions: 8, mindmaps: 2, flashcards: 28, quizzes: 4 },
    { day: "Fri", sessions: 5, mindmaps: 4, flashcards: 20, quizzes: 6 },
    { day: "Sat", sessions: 7, mindmaps: 1, flashcards: 12, quizzes: 3 },
    { day: "Sun", sessions: 4, mindmaps: 2, flashcards: 16, quizzes: 2 }
  ];

  const distributionData = [
    { name: "Chat Sessions", value: 37, color: "#3B82F6" },
    { name: "Mind Maps", value: 15, color: "#8B5CF6" },
    { name: "Flashcards", value: 131, color: "#F59E0B" },
    { name: "Quizzes", value: 25, color: "#10B981" }
  ];

  const summaryStats = [
    {
      title: "Total Sessions",
      value: "37",
      change: "+8 this week",
      icon: MessageSquare,
      gradient: "from-blue-500 to-cyan-500",
      changeType: "positive"
    },
    {
      title: "Mind Maps Created",
      value: "15",
      change: "+3 this week",
      icon: Brain,
      gradient: "from-purple-500 to-pink-500",
      changeType: "positive"
    },
    {
      title: "Flashcards Made",
      value: "131",
      change: "+23 this week",
      icon: BookOpen,
      gradient: "from-orange-500 to-red-500",
      changeType: "positive"
    },
    {
      title: "Quizzes Completed",
      value: "25",
      change: "+5 this week",
      icon: FileQuestion,
      gradient: "from-green-500 to-emerald-500",
      changeType: "positive"
    }
  ];

  useEffect(() => {
    if (session?.user) {
      console.log('session.user.image:', session.user.image);
    }
  }, [session]);

  return (
    <div className="min-h-screen transition-colors duration-500 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      <div className="pt-24"> {/* Add padding to account for fixed header */}
        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {/* Analytics Dashboard */}
          <div className="p-4 sm:p-6 lg:p-8 h-full overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {summaryStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.title}
                      className="p-4 sm:p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
                    >
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center shadow-lg`}>
                          <Icon size={18} className="sm:w-5 sm:h-5 text-white" />
                        </div>
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <h3 className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wide">{stat.title}</h3>
                        <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                        <div className="text-xs sm:text-sm font-medium text-green-400">
                          {stat.change}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Weekly Activity Chart */}
                <div className="p-6 sm:p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-md shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                      <BarChart3 size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">Weekly Activity</h3>
                      <p className="text-sm text-slate-400">Your learning activity this week</p>
                    </div>
                  </div>
                  <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#F9FAFB'
                          }} 
                        />
                        <Bar dataKey="sessions" fill="#3B82F6" name="Sessions" />
                        <Bar dataKey="mindmaps" fill="#8B5CF6" name="Mind Maps" />
                        <Bar dataKey="flashcards" fill="#F59E0B" name="Flashcards" />
                        <Bar dataKey="quizzes" fill="#10B981" name="Quizzes" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                {/* Activity Distribution */}
                <div className="p-6 sm:p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-md shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <PieChart size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">Activity Distribution</h3>
                      <p className="text-sm text-slate-400">Breakdown of your learning activities</p>
                    </div>
                  </div>
                  <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={distributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#F9FAFB'
                          }} 
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {distributionData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs sm:text-sm text-slate-300">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
