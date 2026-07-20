import { useState } from "react";
import { useOpenSessions, useSignIn, type OpenSession } from "../../hooks/useStudent";

export function CheckInPage() {
  const { data: sessions, isLoading } = useOpenSessions();
  const signInMutation = useSignIn();
  const [signedInIds, setSignedInIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (sessionId: string) => {
    setError(null);
    try {
      await signInMutation.mutateAsync(sessionId);
      setSignedInIds((prev) => new Set(prev).add(sessionId));
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
            "Failed to sign in";
      setError(msg);
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return timeStr;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Check In</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {signInMutation.isSuccess && (
        <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-700">
          Successfully signed in!
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-white" />
          ))}
        </div>
      ) : !sessions || sessions.length === 0 ? (
        <div className="rounded-md bg-gray-50 p-8 text-center text-sm text-gray-600">
          <p className="text-base font-medium text-gray-700">No open sessions</p>
          <p className="mt-1">
            There are currently no active sessions for your enrolled courses. Check back later.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session: OpenSession) => (
            <div
              key={session.id}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900">
                    {session.course.code} - {session.course.title}
                  </h3>
                  <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Date:</span> {formatDate(session.date)}
                    </p>
                    <p>
                      <span className="font-medium">Time:</span> {formatTime(session.startTime)}
                    </p>
                    <p>
                      <span className="font-medium">Venue:</span> {session.venue || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Mode:</span>{" "}
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          session.modeOfTeaching === "online"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {session.modeOfTeaching === "online" ? "Online" : "Physical"}
                      </span>
                    </p>
                  </div>
                  {session.topic && (
                    <p className="mt-2 text-sm text-gray-500">
                      <span className="font-medium">Topic:</span> {session.topic}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {signedInIds.has(session.id) ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Signed In
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSignIn(session.id)}
                      disabled={signInMutation.isPending}
                      className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {signInMutation.isPending ? "Signing In..." : "Sign In"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
