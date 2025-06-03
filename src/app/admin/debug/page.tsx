import React from 'react';

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Fixed Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-red-500/20 border-r-4 border-red-500 z-50">
        <div className="p-4">
          <h2 className="text-xl font-bold">DEBUG: Sidebar</h2>
          <p>This should be fixed to the left</p>
          <p>Width: 16rem (256px)</p>
        </div>
      </div>
      
      {/* Main Content with margin */}
      <div className="ml-64 bg-blue-500/20 min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-4">DEBUG: Main Content</h1>
        <p className="mb-4">This content should NOT be behind the sidebar.</p>
        <p className="mb-4">It has margin-left: 16rem (256px) to push it to the right of the sidebar.</p>
        
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-green-500/20 p-4 rounded">
            <h3 className="font-bold">Card 1</h3>
            <p>Testing layout</p>
          </div>
          <div className="bg-green-500/20 p-4 rounded">
            <h3 className="font-bold">Card 2</h3>
            <p>Should be visible</p>
          </div>
          <div className="bg-green-500/20 p-4 rounded">
            <h3 className="font-bold">Card 3</h3>
            <p>Not behind sidebar</p>
          </div>
        </div>
      </div>
    </div>
  );
}