import React from 'react';
import { Navigate, Route, Routes, createBrowserRouter } from 'react-router-dom';
import MigrationAssessmentPage from '../pages/MigrationAssessmentPage';

export const routes = (
  <Routes>
    <Route path="/migrate" element={<MigrationAssessmentPage />}/> 
    <Route path="*" element={<Navigate to="/migrate" />} />
  </Routes>
);