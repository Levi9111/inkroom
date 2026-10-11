import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { LandingPage } from './pages/LandingPage';
import { BoardPage } from './pages/BoardPage';
import './index.css';

function Root() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);
  const [currentHash, setCurrentHash] = useState(() => window.location.hash);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setCurrentHash(window.location.hash);
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // /b/:roomCode  → student classroom
  const studentMatch = currentPath.match(/^\/b\/([a-zA-Z0-9_-]+)$/i);
  // /t/:boardId   → teacher view with secret in hash
  const teacherMatch = currentPath.match(/^\/t\/([a-zA-Z0-9_-]+)$/);

  if (studentMatch) {
    return <BoardPage roomCode={studentMatch[1]} />;
  }

  if (teacherMatch) {
    const hash = currentHash.startsWith('#') ? currentHash.slice(1) : currentHash;
    return <BoardPage boardId={teacherMatch[1]} teacherHash={hash} />;
  }

  return <LandingPage />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
