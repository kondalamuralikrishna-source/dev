import React, { useState, useEffect } from "react";
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  ShieldCheck,
  Award,
  Zap,
  BookOpen,
  MessageSquare,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  Hash,
} from "lucide-react";
import { ActivityFeedItem, UserRole } from "../types";

interface ActivityPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface AdminActivityLogProps {
  initialActivities?: ActivityFeedItem[];
  onRefreshParent?: () => void;
}

export const AdminActivityLog: React.FC<AdminActivityLogProps> = ({
  initialActivities,
  onRefreshParent,
}) => {
  const [activities, setActivities] = useState<ActivityFeedItem[]>(
    initialActivities || []
  );
  const [pagination, setPagination] = useState<ActivityPagination>({
    page: 1,
    limit: 10,
    total: initialActivities?.length || 0,
    totalPages: Math.ceil((initialActivities?.length || 0) / 10) || 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedActivityDetail, setSelectedActivityDetail] = useState<ActivityFeedItem | null>(null);

  const fetchActivities = async (targetPage: number = pagination.page) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: targetPage.toString(),
        limit: pageSize.toString(),
        type: typeFilter,
        role: roleFilter,
        search: searchTerm,
      });

      const res = await fetch(`/api/admin/activities?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        // Fallback local slicing if endpoint unreachable
        let list = initialActivities || [];
        if (typeFilter !== "ALL") list = list.filter((a) => a.type === typeFilter);
        if (roleFilter !== "ALL") list = list.filter((a) => a.userRole === roleFilter);
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          list = list.filter(
            (a) =>
              a.userId.toLowerCase().includes(q) ||
              a.userName.toLowerCase().includes(q) ||
              a.title.toLowerCase().includes(q) ||
              a.detail.toLowerCase().includes(q)
          );
        }
        const total = list.length;
        const totalPages = Math.ceil(total / pageSize) || 1;
        const startIndex = (targetPage - 1) * pageSize;
        setActivities(list.slice(startIndex, startIndex + pageSize));
        setPagination({
          page: targetPage,
          limit: pageSize,
          total,
          totalPages,
          hasNextPage: targetPage < totalPages,
          hasPrevPage: targetPage > 1,
        });
      }
    } catch (err) {
      console.error("Failed to fetch paginated activities:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(1);
  }, [typeFilter, roleFilter, pageSize]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchActivities(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchActivities(newPage);
    }
  };

  const getActivityBadge = (type: ActivityFeedItem["type"]) => {
    switch (type) {
      case "stress":
        return {
          icon: <Zap size={13} className="text-rose-500" />,
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          label: "Stress Test",
        };
      case "quiz":
        return {
          icon: <Award size={13} className="text-amber-500" />,
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          label: "Mastery Quiz",
        };
      case "lesson":
        return {
          icon: <BookOpen size={13} className="text-indigo-500" />,
          bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
          label: "Grammar Lesson",
        };
      case "chat":
        return {
          icon: <MessageSquare size={13} className="text-sky-500" />,
          bg: "bg-sky-50 text-sky-700 border-sky-200",
          label: "AI Conversation",
        };
      case "vocab":
        return {
          icon: <Sparkles size={13} className="text-emerald-500" />,
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          label: "Vocabulary",
        };
      case "login":
      default:
        return {
          icon: <ShieldCheck size={13} className="text-slate-500" />,
          bg: "bg-slate-50 text-slate-700 border-slate-200",
          label: "Auth / System",
        };
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "admin":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "student":
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Activity size={18} />
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              System Activity & Audit Log
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700">
              {pagination.total} Records
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time audit log tracking user sessions, assessment submissions, and system events for live monitoring and troubleshooting.
          </p>
        </div>

        {/* Search, Filter & Refresh toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user ID, name, activity..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44 sm:w-60"
            />
          </form>

          {/* Activity Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
            <Filter size={12} className="text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Activity Types</option>
              <option value="stress">Speaking Stress Tests</option>
              <option value="quiz">Grammar Quizzes</option>
              <option value="lesson">Lessons Finished</option>
              <option value="chat">AI Roleplay</option>
              <option value="vocab">Vocabulary Decks</option>
              <option value="login">Authentication / Login</option>
            </select>
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
          </select>

          {/* Refresh button */}
          <button
            type="button"
            onClick={() => {
              fetchActivities(pagination.page);
              if (onRefreshParent) onRefreshParent();
            }}
            disabled={isLoading}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh logs"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Main Activities Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-3">User ID & Name</th>
              <th className="py-3 px-3">Role</th>
              <th className="py-3 px-3">Activity Type</th>
              <th className="py-3 px-3">Event & Description</th>
              <th className="py-3 px-3">Score / Outcome</th>
              <th className="py-3 px-3">Timestamp (UTC)</th>
              <th className="py-3 px-3 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activities.map((item) => {
              const badge = getActivityBadge(item.type);
              const dateObj = new Date(item.timestamp);
              const formattedTime = dateObj.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });
              const formattedDate = dateObj.toLocaleDateString([], {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => setSelectedActivityDetail(item)}
                >
                  {/* User ID & Name */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={
                          item.avatarUrl ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${item.userName}`
                        }
                        alt={item.userName}
                        className="w-7 h-7 rounded-xl border border-slate-200 shrink-0 bg-white"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 block truncate group-hover:text-indigo-600">
                          {item.userName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block truncate">
                          {item.userId}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${getRoleBadge(
                        item.userRole
                      )}`}
                    >
                      {item.userRole}
                    </span>
                  </td>

                  {/* Activity Type */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${badge.bg}`}
                    >
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>
                  </td>

                  {/* Title & Detail */}
                  <td className="py-3 px-3 max-w-xs">
                    <div className="font-bold text-slate-800 truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {item.detail}
                    </div>
                  </td>

                  {/* Score */}
                  <td className="py-3 px-3">
                    {item.score !== undefined ? (
                      <span
                        className={`inline-flex items-center gap-1 font-black text-xs ${
                          item.score >= 90
                            ? "text-emerald-600"
                            : item.score >= 75
                            ? "text-indigo-600"
                            : "text-amber-600"
                        }`}
                      >
                        <CheckCircle2 size={12} />
                        {item.score}%
                      </span>
                    ) : (
                      <span className="text-slate-300 font-mono text-[11px]">—</span>
                    )}
                  </td>

                  {/* Timestamp */}
                  <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                    <div className="flex items-center gap-1 text-slate-700 font-semibold">
                      <Clock size={11} className="text-slate-400" />
                      <span>{formattedTime}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{formattedDate}</span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedActivityDetail(item);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 font-bold rounded-lg text-[11px] transition-colors"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {activities.length === 0 && !isLoading && (
          <div className="py-12 text-center text-slate-400 font-semibold text-xs space-y-2">
            <AlertCircle size={24} className="mx-auto text-slate-300" />
            <p>No activity records match the selected filter criteria.</p>
          </div>
        )}

        {isLoading && (
          <div className="py-8 text-center text-slate-400 text-xs font-semibold flex items-center justify-center gap-2">
            <RefreshCw size={14} className="animate-spin text-indigo-500" />
            <span>Loading telemetry stream...</span>
          </div>
        )}
      </div>

      {/* Pagination Controls Footer */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500 font-semibold">
          <span>Show per page:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-700 focus:outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-slate-400">
            Showing {(pagination.page - 1) * pagination.limit + 1} -{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} activities
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.hasPrevPage || isLoading}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft size={14} />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1 px-2">
            <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
              {pagination.page}
            </span>
            <span className="text-slate-400 font-medium">/</span>
            <span className="text-slate-600 font-bold px-1.5">
              {pagination.totalPages}
            </span>
          </div>

          <button
            type="button"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasNextPage || isLoading}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Activity Details Diagnostic Modal */}
      {selectedActivityDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 relative">
            <button
              type="button"
              onClick={() => setSelectedActivityDetail(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 font-bold text-sm w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                {getActivityBadge(selectedActivityDetail.type).icon}
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">
                  {selectedActivityDetail.title}
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  Activity ID: {selectedActivityDetail.id}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="font-bold text-slate-500">User Identification:</span>
                <span className="font-mono font-bold text-indigo-700">
                  {selectedActivityDetail.userName} ({selectedActivityDetail.userId})
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="font-bold text-slate-500">Assigned Role:</span>
                <span className="font-extrabold uppercase text-slate-800">
                  {selectedActivityDetail.userRole}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="font-bold text-slate-500">Activity Category:</span>
                <span className="font-bold capitalize text-slate-800">
                  {selectedActivityDetail.type}
                </span>
              </div>

              {selectedActivityDetail.score !== undefined && (
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="font-bold text-slate-500">Evaluated Score:</span>
                  <span className="font-black text-emerald-600">
                    {selectedActivityDetail.score}%
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="font-bold text-slate-500">Timestamp:</span>
                <span className="font-mono text-slate-700">
                  {new Date(selectedActivityDetail.timestamp).toISOString()}
                </span>
              </div>

              <div className="space-y-1 pt-1">
                <span className="font-bold text-slate-500 block">Activity Detail:</span>
                <p className="text-slate-800 bg-white p-3 rounded-xl border border-slate-200 font-medium leading-relaxed">
                  {selectedActivityDetail.detail}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedActivityDetail(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Close Activity Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
