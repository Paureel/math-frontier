import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import {discardLegacyPreferences} from '../lib/privacy.mjs';
discardLegacyPreferences();
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
