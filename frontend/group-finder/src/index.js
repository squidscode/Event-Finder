import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './app';

// eslint-disable-next-line
const SERVER = "http://squidscode.com:3000";

const root = ReactDOM.createRoot(document.getElementById('navbar'));
root.render(
  <App />
);