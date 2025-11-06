'use client'

import React from 'react';
import { cn } from '@/lib/utils';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={cn("bg-white rounded-lg shadow-sm border border-gray-200", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3 
      className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className = '', ...props }) => {
  return (
    <p 
      className={cn("text-sm text-gray-500", className)}
      {...props}
    >
      {children}
    </p>
  );
};

export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={cn("p-6 pt-0", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card; 