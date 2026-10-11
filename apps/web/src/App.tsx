import React from 'react';
import { useBoardStore } from './stores/boardStore';
import { WhiteboardApp } from './WhiteboardApp';
import { LandingPage } from './pages/LandingPage';

export { WhiteboardApp };

export function App() {
  const { session } = useBoardStore();

  if (!session) {
    return <LandingPage />;
  }

  return <WhiteboardApp session={session} />;
}
