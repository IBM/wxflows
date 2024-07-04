// Copyright IBM Corp. 2020, 2024
import React from 'react';
import { createRoot } from 'react-dom';
import './index.css'
import App from './App'

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <App />
)
