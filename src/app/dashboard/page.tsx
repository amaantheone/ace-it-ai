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
import { useAnalytics } from "@/hooks/useAnalytics";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";

interface DistributionDataItem {
  name: string;
  value: number;
  color: string;
}

interface SummaryStatWithIcon {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{size?: number; className?: string}>;
  gradient: string;
  changeType: string;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const { analytics, isLoading, error } = useAnalytics();

  useEffect(() => {
    if (session?.user) {
      console.log('session.user.image:', session.user.image);
    }
  }, [session]);

  // Show sign-in prompt for non-authenticated users
  if (!session?.user?.email) {
    return (
      <div className="min-h-screen transition-colors duration-500 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header />
        <div className="pt-24">
          <main className="flex-1 overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8 h-full overflow-auto">
              <div className="max-w-4xl mx-auto">
                <div className="text-center py-16 sm:py-24">
                  <div className="p-8 sm:p-12 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-md shadow-xl">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                      <BarChart3 size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                      Welcome to Your Analytics Dashboard
                    </h1>
                    <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                      Track your learning progress, view detailed analytics, and get insights into your study habits. 
                      Sign in to start building your personalized learning journey.
                    </p>
                    <div className="space-y-4">
                      <button
                        onClick={() => window.location.href = '/auth/login'}
                        className="inline-flex items-center px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <MessageSquare size={20} className="mr-2" />
                        Sign In to Get Started
                      </button>
                      <p className="text-sm text-slate-400">
                        Already have an account? Sign in to see your learning analytics and progress.
                      </p>
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

  // Show loading skeleton while fetching data
  if (isLoading && !analytics) {
    return (
      <>
        <Header />
        <DashboardSkeleton />
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen transition-colors duration-500 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header />
        <div className="pt-24">
          <main className="flex-1 overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8 h-full overflow-auto">
              <div className="max-w-4xl mx-auto text-center py-16">
                <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-md shadow-xl">
                  <h2 className="text-2xl font-bold text-white mb-4">Failed to Load Analytics</h2>
                  <p className="text-slate-300 mb-6">We&apos;re having trouble loading your dashboard data. Please try refreshing the page.</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Fallback data for when data is not yet loaded
  const fallbackWeeklyData = [
    { day: "Mon", sessions: 0, mindmaps: 0, flashcards: 0, quizzes: 0 },
    { day: "Tue", sessions: 0, mindmaps: 0, flashcards: 0, quizzes: 0 },
    { day: "Wed", sessions: 0, mindmaps: 0, flashcards: 0, quizzes: 0 },
    { day: "Thu", sessions: 0, mindmaps: 0, flashcards: 0, quizzes: 0 },
    { day: "Fri", sessions: 0, mindmaps: 0, flashcards: 0, quizzes: 0 },
    { day: "Sat", sessions: 0, mindmaps: 0, flashcards: 0, quizzes: 0 },
    { day: "Sun", sessions: 0, mindmaps: 0, flashcards: 0, quizzes: 0 }
  ];

  const fallbackDistributionData = [
    { name: "Chat Sessions", value: 0, color: "#3B82F6" },
    { name: "Mind Maps", value: 0, color: "#8B5CF6" },
    { name: "Flashcards", value: 0, color: "#F59E0B" },
    { name: "Quizzes", value: 0, color: "#10B981" }
  ];

  // Use real data if available, otherwise use fallback
  const weeklyData = analytics?.weeklyData || fallbackWeeklyData;
  const distributionData = analytics?.distributionData || fallbackDistributionData;
  const summaryStats: SummaryStatWithIcon[] = analytics?.summaryStats ? analytics.summaryStats.map((stat) => ({
    ...stat,
    icon: stat.icon === "MessageSquare" ? MessageSquare :
          stat.icon === "Brain" ? Brain :
          stat.icon === "BookOpen" ? BookOpen :
          stat.icon === "FileQuestion" ? FileQuestion : MessageSquare
  })) : [
    {
      title: "Total Sessions",
      value: "0",
      change: "",
      icon: MessageSquare,
      gradient: "from-blue-500 to-cyan-500",
      changeType: "positive"
    },
    {
      title: "Mind Maps Created",
      value: "0",
      change: "",
      icon: Brain,
      gradient: "from-purple-500 to-pink-500",
      changeType: "positive"
    },
    {
      title: "Flashcards Made",
      value: "0",
      change: "",
      icon: BookOpen,
      gradient: "from-orange-500 to-red-500",
      changeType: "positive"
    },
    {
      title: "Quizzes Completed",
      value: "0",
      change: "",
      icon: FileQuestion,
      gradient: "from-green-500 to-emerald-500",
      changeType: "positive"
    }
  ];

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
                {summaryStats.map((stat: SummaryStatWithIcon) => {
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
                        {stat.change && (
                          <div className="text-xs sm:text-sm font-medium text-green-400">
                            {stat.change}
                          </div>
                        )}
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
                          {distributionData.map((entry: DistributionDataItem, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#F9FAFB', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#F9FAFB'
                          }} 
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {distributionData.map((item: DistributionDataItem) => (
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
