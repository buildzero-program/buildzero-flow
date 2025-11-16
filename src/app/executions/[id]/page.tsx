import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "~/lib/db";

export const dynamic = 'force-dynamic';

export default async function ExecutionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const execution = await db.execution.findUnique({
    where: { id },
    include: {
      logs: {
        orderBy: { startedAt: 'asc' }
      }
    }
  });

  if (!execution) {
    notFound();
  }

  const duration = execution.finishedAt
    ? new Date(execution.finishedAt).getTime() - new Date(execution.startedAt).getTime()
    : null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← Back to executions
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Execution Details</h1>
          <p className="text-slate-400">{execution.id}</p>
        </div>

        {/* Execution Summary */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-slate-400">Workflow</div>
              <div className="text-white font-medium mt-1">{execution.workflowId}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Status</div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                execution.status === 'COMPLETED'
                  ? 'bg-green-500/20 text-green-400'
                  : execution.status === 'FAILED'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                {execution.status}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Started</div>
              <div className="text-white font-medium mt-1">
                {new Date(execution.startedAt).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Duration</div>
              <div className="text-white font-medium mt-1">
                {duration !== null ? `${duration}ms` : 'In progress...'}
              </div>
            </div>
          </div>
        </div>

        {/* Execution Logs */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-white">Execution Logs</h2>
          </div>

          <div className="divide-y divide-slate-700">
            {execution.logs.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-400">
                No logs yet
              </div>
            ) : (
              execution.logs.map((log, index) => (
                <div key={log.id} className="px-6 py-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-slate-500 font-mono text-sm">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="text-white font-medium">{log.nodeName}</div>
                        <div className="text-sm text-slate-400">{log.nodeId}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-slate-400">
                        {log.durationMs !== null ? `${log.durationMs}ms` : 'Running...'}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        log.status === 'SUCCESS'
                          ? 'bg-green-500/20 text-green-400'
                          : log.status === 'FAILED'
                          ? 'bg-red-500/20 text-red-400'
                          : log.status === 'RETRYING'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {log.status}
                      </div>
                    </div>
                  </div>

                  {/* Input */}
                  <div className="mb-3">
                    <div className="text-sm text-slate-400 mb-1">Input:</div>
                    <pre className="bg-slate-900 rounded p-3 text-sm text-slate-300 overflow-x-auto">
                      {JSON.stringify(log.input, null, 2)}
                    </pre>
                  </div>

                  {/* Output */}
                  {log.output && (
                    <div className="mb-3">
                      <div className="text-sm text-slate-400 mb-1">Output:</div>
                      <pre className="bg-slate-900 rounded p-3 text-sm text-slate-300 overflow-x-auto">
                        {JSON.stringify(log.output, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Error */}
                  {log.error && (
                    <div>
                      <div className="text-sm text-red-400 mb-1">Error:</div>
                      <pre className="bg-red-900/20 rounded p-3 text-sm text-red-300 overflow-x-auto">
                        {log.error}
                      </pre>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
