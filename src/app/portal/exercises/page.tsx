"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Dumbbell,
  CheckCircle2,
  Circle,
  Play,
  RotateCw,
  Clock,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Calendar,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";
import { Exercise } from "@/types";

export default function PatientPortalExercisesPage() {
  const { activeTenant } = useTenant();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Connected patient
  const contacts = mockStore.getContacts(activeTenant.id);
  const patient = contacts[0] || { id: "cnt-1", fullName: "Priya Sharma" };

  const loadExercises = () => {
    const list = mockStore.getExercises(activeTenant.id, patient.id);
    setExercises(list);
  };

  useEffect(() => {
    loadExercises();
    const unsubscribe = mockStore.subscribe(loadExercises);
    return () => unsubscribe();
  }, [activeTenant.id, patient.id]);

  const completedCount = exercises.filter((e) => e.completedToday).length;
  const progressPercent = exercises.length > 0 ? Math.round((completedCount / exercises.length) * 100) : 0;

  const handleToggle = (ex: Exercise) => {
    const nextState = !ex.completedToday;
    mockStore.toggleExerciseCompletion(ex.id, nextState);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#16181F] via-[#141A24] to-[#121E24] border border-[#272B38] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-1">
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Physical Rehabilitation Programme</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Home Mobility &amp; Strengthening
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Prescribed exercise protocol to restore range of motion and functional stability. Check off each exercise as you complete your sets today.
            </p>
          </div>

          {/* Adherence Metric */}
          <div className="p-4 rounded-2xl bg-[#101217]/80 border border-[#232733] shrink-0 text-center sm:text-right">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Today&apos;s Protocol Adherence
            </span>
            <div className="flex items-baseline justify-center sm:justify-end gap-2 mt-1">
              <span className="text-2xl font-bold text-white font-mono">{progressPercent}%</span>
              <span className="text-xs text-sky-400 font-medium">
                ({completedCount}/{exercises.length} Complete)
              </span>
            </div>
            <div className="h-1.5 w-40 bg-slate-800 rounded-full mt-2 overflow-hidden mx-auto sm:ml-auto">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>Daily Routine</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1F232B] text-sky-400 border border-[#2C313D]">
              {exercises.length} Exercises
            </span>
          </h2>

          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Est. total time: ~20 mins</span>
          </span>
        </div>

        {exercises.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#14161B] border border-[#232630] text-center space-y-3">
            <Dumbbell className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-200">No active home exercises</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your physiotherapist will configure and assign your specialized kinetic exercise protocol during your clinical assessment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exercises.map((ex) => {
              const isDone = ex.completedToday;

              return (
                <div
                  key={ex.id}
                  className={`p-6 rounded-3xl border transition-all space-y-4 ${
                    isDone
                      ? "bg-[#12191D] border-teal-900/60 shadow-sm"
                      : "bg-[#14161B] border-[#232630] hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#1C1F28] text-slate-400 border border-[#2A2E3B]">
                          {ex.frequency}
                        </span>
                        {isDone && (
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white">{ex.title}</h3>
                    </div>

                    <button
                      onClick={() => handleToggle(ex)}
                      className={`p-2 rounded-xl border transition-all ${
                        isDone
                          ? "bg-teal-600 hover:bg-teal-700 border-teal-500 text-white"
                          : "bg-[#1C1F28] hover:bg-[#252A36] border-[#2B2F3D] text-slate-400 hover:text-white"
                      }`}
                      title={isDone ? "Mark as incomplete" : "Mark as completed"}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {ex.instruction}
                  </p>

                  <div className="p-3 rounded-2xl bg-[#101217] border border-[#22252C] flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-slate-500 text-[10px] block">SETS</span>
                        <span className="text-slate-200 font-bold">{ex.sets}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">REPETITIONS</span>
                        <span className="text-slate-200 font-bold">{ex.reps}</span>
                      </div>
                      {ex.duration && (
                        <div>
                          <span className="text-slate-500 text-[10px] block">DURATION</span>
                          <span className="text-teal-400 font-bold">{ex.duration}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedExercise(ex)}
                      className="text-sky-400 hover:text-sky-300 font-sans font-semibold flex items-center gap-1 text-[11px]"
                    >
                      <span>Instructions</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Safety & Form Guidance Box */}
      <div className="p-6 rounded-3xl bg-[#14161B] border border-[#232630] space-y-3 text-xs">
        <div className="flex items-center gap-2 text-amber-400">
          <AlertCircle className="w-4 h-4" />
          <h3 className="font-bold">Clinical Safety Notice</h3>
        </div>
        <p className="text-slate-400 leading-relaxed">
          Mild muscle fatigue and gentle stretch tension are normal during recovery. However, if you experience sharp, localized pain (above 4/10 on the pain scale) or joint swelling, immediately pause the movement and reach out to your therapist via the{" "}
          <Link href="/portal/messages" className="text-teal-400 underline">
            Patient Chat
          </Link>
          .
        </p>
      </div>

      {/* Detail Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16181F] border border-[#2A2E3B] rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider">
                  Exercise Breakdown
                </span>
                <h3 className="text-lg font-bold text-white">{selectedExercise.title}</h3>
              </div>
              <button
                onClick={() => setSelectedExercise(null)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#101216] border border-[#22252C] grid grid-cols-3 gap-2 text-center font-mono">
                <div>
                  <span className="text-slate-500 text-[10px] block">Sets</span>
                  <span className="text-base font-bold text-white">{selectedExercise.sets}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Reps</span>
                  <span className="text-base font-bold text-white">{selectedExercise.reps}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Duration / Frequency</span>
                  <span className="text-base font-bold text-teal-400">
                    {selectedExercise.duration || selectedExercise.frequency}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-200 mb-1">Step-by-Step Instructions</h4>
                <p className="text-slate-400 leading-relaxed bg-[#12141A] p-4 rounded-2xl border border-[#232630]">
                  {selectedExercise.instruction}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedExercise(null)}
                  className="px-4 py-2 rounded-xl bg-transparent hover:bg-[#20232C] text-slate-300 font-medium"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleToggle(selectedExercise);
                    setSelectedExercise(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold flex items-center gap-1.5 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {selectedExercise.completedToday ? "Mark Incomplete" : "Mark as Completed"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
