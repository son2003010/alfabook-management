import React from 'react';

export const Card = ({ children }) => (
  <div className="border rounded-lg shadow p-4">
    {children}
  </div>
);

export const CardHeader = ({ children }) => (
  <div className="border-b pb-2 mb-4">
    {children}
  </div>
);

export const CardContent = ({ children }) => (
  <div>
    {children}
  </div>
);
