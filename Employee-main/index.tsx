
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './styles/globals.css';
import { queryClient } from './state/queryClient';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

registerSW({
  immediate: true,
  onNeedRefresh() {
    console.info('New content available. Reload the app.');
  },
  onOfflineReady() {
    console.info('App ready to work offline');
  },
});
