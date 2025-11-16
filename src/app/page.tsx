import Link from "next/link";
import { db } from "~/lib/db";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const executions = await db.execution.findMany({
    orderBy: { startedAt: 'desc' },
    take: 50
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">BuildZero Flow</h1>
          <p className="text-slate-400 mt-2">Workflow execution dashboard</p>
        </div>

        <div className="bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-white">Recent Executions</h2>
          </div>

          <div className="divide-y divide-slate-700">
            {executions.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-400">
                No executions yet
              </div>
            ) : (
              executions.map((execution) => (
                <Link
                  key={execution.id}
                  href={`/executions/${execution.id}`}
                  className="block px-6 py-4 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">{execution.workflowId}</div>
                      <div className="text-sm text-slate-400 mt-1">
                        {execution.id}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-slate-400">
                        {new Date(execution.startedAt).toLocaleString()}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        execution.status === 'COMPLETED'
                          ? 'bg-green-500/20 text-green-400'
                          : execution.status === 'FAILED'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {execution.status}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
