// components/ErrorBoundary.tsx
import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) => {
  return (
    <div role="alert" className="p-4 border border-red-500 bg-red-100 rounded">
      <p className="text-red-500">Something went wrong:</p>
      <pre className="text-red-500 whitespace-pre-wrap break-words">{error.message}</pre>
      <button onClick={resetErrorBoundary} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
        Try again
      </button>
    </div>
  );
};

const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the state of your application so the error doesn't happen again
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;