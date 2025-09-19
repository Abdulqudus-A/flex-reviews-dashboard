import React from 'react';
import Dashboard from './pages/Dashboard';
import PropertyPage from './pages/PropertyPage';

export interface AppRoute {
  path: string;
  component: React.ComponentType<any>;
}

const routes: AppRoute[] = [
  { path: '/', component: Dashboard },
  { path: '/property/:id', component: PropertyPage }
];

export default routes;
