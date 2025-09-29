"use client";

import { useEffect, useState } from "react";
import SpinWheel from "@/components/SpinWheel";

type Team = {
  id: number;
  name: string;
  members: string[];
  eliminated: string[];
};

const TEAM_COLORS = [
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#8B5CF6', // Violet (repeat)
];

export default function DashboardPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showWheelFor, setShowWheelFor] = useState<number | null>(null);

  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("lms_teams");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Team[];
        setTeams(parsed.map(t => ({ ...t, eliminated: t.eliminated || [] })));
        return;
      } catch {
        // ignore
      }
    }
    setTeams([]);
  }, []);

  const persist = (next: Team[]) => {
    setTeams(next);
    localStorage.setItem("lms_teams", JSON.stringify(next));
  };

  const onDragStart = (e: React.DragEvent, idx: number) => {
    setDragIndex(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIndex(idx);
  };

  const onDragLeave = () => {
    setDragOverIndex(null);
  };

  const onDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === idx) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    // Swap the two teams directly
    const next = [...teams];
    [next[dragIndex], next[idx]] = [next[idx], next[dragIndex]];
    persist(next);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleEliminate = (teamIndex: number, memberName: string) => {
    const next = teams.map((t, i) => {
      if (i !== teamIndex) return t;
      const members = t.members.filter(m => m !== memberName);
      return { ...t, members, eliminated: [...t.eliminated, memberName] };
    });
    persist(next);
    setTimeout(() => setShowWheelFor(null), 800);
  };

  const manualRemove = (teamIndex: number, memberName: string) => {
    if (!confirm(`Eliminate ${memberName} from ${teams[teamIndex].name}?`)) return;
    const next = teams.map((t, i) => {
      if (i !== teamIndex) return t;
      const members = t.members.filter(m => m !== memberName);
      return { ...t, members, eliminated: [...t.eliminated, memberName] };
    });
    persist(next);
  };

  const reviveMember = (teamIndex: number, memberName: string) => {
    const next = teams.map((t, i) => {
      if (i !== teamIndex) return t;
      const eliminated = t.eliminated.filter(e => e !== memberName);
      const members = [...t.members, memberName];
      return { ...t, members, eliminated };
    });
    persist(next);
  };

  const addMember = (teamIndex: number) => {
    const name = prompt("Enter member name:");
    if (!name || !name.trim()) return;
    const next = teams.map((t, i) => (i === teamIndex ? { ...t, members: [...t.members, name.trim()] } : t));
    persist(next);
  };

  const saveNow = () => {
    localStorage.setItem("lms_teams", JSON.stringify(teams));
    alert("Teams saved successfully!");
  };

  const totalActive = teams.reduce((sum, t) => sum + t.members.length, 0);
  const totalEliminated = teams.reduce((sum, t) => sum + t.eliminated.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950">
      
      {/* Header */}
      <div className="border-b border-indigo-500/20 bg-slate-900/70 backdrop-blur-md sticky top-0 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-purple-100 tracking-tight mb-2">
                Team Dashboard
              </h1>
              <p className="text-purple-300 text-sm tracking-wide">
                Manage teams and track eliminations
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl px-6 py-3">
                <div className="text-xs text-indigo-300 mb-1 tracking-wider uppercase">Active Players</div>
                <div className="text-2xl font-bold text-indigo-100">{totalActive}</div>
              </div>
              
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-6 py-3">
                <div className="text-xs text-red-300 mb-1 tracking-wider uppercase">Eliminated</div>
                <div className="text-2xl font-bold text-red-100">{totalEliminated}</div>
              </div>
              
              <button
                onClick={saveNow}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-violet-500/50"
              >
                Save Progress
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {teams.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-slate-800/50 border border-indigo-500/20 rounded-2xl p-12 max-w-2xl mx-auto backdrop-blur-sm">
              <div className="text-6xl mb-6">🚀</div>
              <h3 className="text-3xl font-bold text-indigo-100 mb-4">
                No Teams Yet
              </h3>
              <p className="text-indigo-300 text-lg mb-6">
                Create teams to start tracking your game
              </p>
              <p className="text-indigo-400 text-sm">
                Visit the Teams page to set up your game
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {teams.map((team, idx) => {
              const teamColor = TEAM_COLORS[idx % TEAM_COLORS.length];
              const progress = team.members.length + team.eliminated.length > 0 
                ? (team.members.length / (team.members.length + team.eliminated.length)) * 100 
                : 0;
              
              return (
                <div
                  key={team.id}
                  draggable={true}
                  onDragStart={(e) => onDragStart(e, idx)}
                  onDragOver={(e) => onDragOver(e, idx)}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onDrop(e, idx)}
                  className={`group bg-slate-800/50 border rounded-2xl p-6 backdrop-blur-sm cursor-move transition-all duration-300 hover:shadow-lg ${
                    dragIndex === idx 
                      ? 'scale-105 shadow-2xl shadow-indigo-500/40 z-50 border-indigo-500/60 bg-slate-800/70' 
                      : dragOverIndex === idx
                      ? 'border-indigo-500/60 shadow-lg shadow-indigo-500/30 bg-slate-800/60'
                      : 'border-indigo-500/20 hover:border-indigo-500/40 hover:shadow-indigo-500/20'
                  }`}
                >
                  
                  {/* Team Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg"
                        style={{ 
                          backgroundColor: teamColor,
                          boxShadow: `0 0 20px ${teamColor}40`
                        }}
                      >
                        {team.id}
                      </div>
                      <div>
                        <div className="text-xs text-indigo-300 mb-1 tracking-wider uppercase">Team</div>
                        <h3 className="text-xl font-bold text-indigo-100">
                          {team.name}
                        </h3>
                      </div>
                    </div>
                    <div className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg">
                      Drag
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-indigo-400 uppercase tracking-wider">Survival Rate</span>
                      <span className="text-sm font-bold text-indigo-100">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Active Members */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-green-400 uppercase tracking-wider">
                        Active Members
                      </h4>
                      <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-lg font-bold">
                        {team.members.length}
                      </span>
                    </div>
                    
                    {team.members.length === 0 ? (
                      <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center">
                        <div className="text-slate-600 text-sm">No active members</div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {team.members.map((member) => (
                          <div 
                            key={member} 
                            className="group/member flex items-center justify-between p-3 rounded-xl bg-slate-700/50 hover:bg-slate-700 transition-all duration-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                              <span className="text-indigo-100 font-medium">{member}</span>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); manualRemove(idx, member); }}
                              className="opacity-0 group-hover/member:opacity-100 text-xs px-3 py-1 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all duration-200"
                            >
                              Eliminate
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Eliminated Members */}
                  {team.eliminated.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider">
                          Eliminated
                        </h4>
                        <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-lg font-bold">
                          {team.eliminated.length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {team.eliminated.map((member) => (
                          <div 
                            key={member} 
                            className="group/elim flex items-center justify-between p-3 rounded-xl bg-red-900/20 border border-red-800/30 transition-all duration-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-red-500" />
                              <span className="text-red-300 font-medium line-through opacity-75">{member}</span>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); reviveMember(idx, member); }}
                              className="opacity-0 group-hover/elim:opacity-100 text-xs px-3 py-1 rounded-lg bg-green-500/20 text-green-300 hover:bg-green-500/30 transition-all duration-200"
                            >
                              Revive
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Team Actions */}
                  <div className="flex gap-2 pt-4 border-t border-indigo-500/20">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowWheelFor(idx); }}
                      disabled={team.members.length === 0}
                      className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm hover:scale-105 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-indigo-500/50"
                    >
                      Random
                    </button>
                    
                    <button
                      onClick={(e) => { e.stopPropagation(); addMember(idx); }}
                      className="px-4 py-3 rounded-xl bg-slate-700 text-indigo-100 font-bold text-sm hover:bg-slate-600 transition-all duration-300 hover:scale-105"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Spin Wheel Modal */}
      {showWheelFor !== null && teams[showWheelFor] && (
        <SpinWheel
          open={showWheelFor !== null}
          members={teams[showWheelFor].members}
          onClose={() => setShowWheelFor(null)}
          onEliminate={(member) => handleEliminate(showWheelFor, member)}
        />
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(100, 116, 139, 0.1);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  );
}
