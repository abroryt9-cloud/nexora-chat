import React from 'react';
import ChatList from './components/Chat/ChatList';
import ChatWindow from './components/Chat/ChatWindow';
import Sidebar from './components/Layout/Sidebar';

const App = (): JSX.Element => {
  return (
    <div className="app-shell cosmic-theme">
      <Sidebar />
      <main className="main-content">
        <ChatList />
        <ChatWindow />
      </main>
    </div>
  );
};

export default App;
