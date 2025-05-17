import AuthDebug from './auth-debug'
import SupabaseDebug from './supabase-debug'

export default function TestPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-10 text-center">Debugging Tools</h1>
        
        <div className="grid gap-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Supabase Connection</h2>
            <SupabaseDebug />
          </div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Authentication</h2>
            <AuthDebug />
          </div>
        </div>
      </div>
    </main>
  );
}