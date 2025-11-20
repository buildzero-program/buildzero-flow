import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "~/lib/db";
import { SignOutLink } from "~/components/sign-out-link";
import { getAllWorkflows } from "~/workflows/registry";

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Check authentication
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Get Clerk user to extract email
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Error</h2>
          <p className="mt-2 text-slate-400">No email found in your account</p>
        </div>
      </div>
    );
  }

  // Get or create user in database
  // Try to find by email first (handles Clerk project changes)
  let user = await db.user.findUnique({
    where: { email }
  });

  if (!user) {
    // User doesn't exist, create new one
    user = await db.user.create({
      data: {
        email,
        clerkUserId: userId,
        name: clerkUser.firstName && clerkUser.lastName
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser.firstName ?? clerkUser.lastName ?? undefined
      }
    });
  } else if (user.clerkUserId !== userId) {
    // User exists but has different clerkUserId (Clerk project changed)
    // Update the clerkUserId to the new one
    user = await db.user.update({
      where: { id: user.id },
      data: { clerkUserId: userId }
    });
  }

  // Get user's executions
  const executions = await db.execution.findMany({
    where: { userId: user.id },
    orderBy: { startedAt: 'desc' },
    take: 50
  });

  // Get user's workflows from code registry (filter by ownerEmails)
  const allWorkflows = getAllWorkflows();
  const workflows = allWorkflows.filter(wf => wf.hasAccess(user.email));

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">BuildZero Flow</h1>
            <p className="text-slate-400 mt-2">Workflow execution dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-300">{user.email}</span>
            <SignOutLink />
          </div>
        </div>

        {/* Workflows Section */}
        <div className="mb-8 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-white">My Workflows</h2>
          </div>
          <div className="divide-y divide-slate-700">
            {workflows.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-400">
                No workflows available for your account
              </div>
            ) : (
              workflows.map((workflow) => (
                <div key={workflow.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-white font-medium">{workflow.name}</h3>
                        <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">
                          Active
                        </span>
                      </div>
                      {workflow.description && (
                        <p className="text-sm text-slate-400 mt-1">{workflow.description}</p>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-slate-500">Webhook URL:</span>
                        <code className="text-xs bg-slate-900 text-slate-300 px-3 py-1 rounded">
                          {baseUrl}/api/webhooks/{workflow.id}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Executions Section */}
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
