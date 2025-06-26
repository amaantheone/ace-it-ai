// import Link from "next/link";
// import { HelpCircle } from "lucide-react";

// interface SidebarItem {
//   icon: React.ElementType;
//   label: string;
//   href: string;
//   gradient: string;
// }

// interface SidebarProps {
//   sidebarItems: SidebarItem[];
// }

// export default function DashboardSidebar({ sidebarItems }: SidebarProps) {
//   return (
//     <aside className="hidden lg:flex w-20 bg-slate-800/50 border-r border-slate-700/50 backdrop-blur-md flex-col">
//       {/* Logo */}
//       <div className="p-4 border-b border-slate-700/50">
//         <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg mx-auto">
//           <img src="/Ace It AI.png" alt="Ace It AI Logo" className="w-full h-full object-contain" />
//         </div>
//       </div>
//       {/* Navigation */}
//       <nav className="flex-1 p-4">
//         <div className="space-y-4">
//           {sidebarItems.map((item) => {
//             const Icon = item.icon;
//             return (
//               <Link
//                 key={item.label}
//                 href={item.href}
//                 className="group relative flex items-center justify-center"
//                 title={item.label}
//               >
//                 <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${item.gradient} flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl`}>
//                   <Icon size={20} className="text-white" />
//                 </div>
//                 {/* Tooltip */}
//                 <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
//                   {item.label}
//                 </div>
//               </Link>
//             );
//           })}
//         </div>
//         <div className="mt-8">
//           <Link
//             href="/docs"
//             className="group relative flex items-center justify-center"
//             title="Documentation"
//           >
//             <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl">
//               <HelpCircle size={20} className="text-white" />
//             </div>
//             <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
//               Documentation
//             </div>
//           </Link>
//         </div>
//       </nav>
//       {/* User Menu removed from sidebar */}
//     </aside>
//   );
// }
