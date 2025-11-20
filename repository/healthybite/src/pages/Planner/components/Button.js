// Simple reusable UI components (Button, Card, CardContent)
// Tailwind + clean structure

export const Button = ({ children, onClick, className = "", ...props }) => {
    return (
      <button
        onClick={onClick}
        className={`px-4 py-2 rounded-xl shadow-sm font-medium hover:opacity-90 transition ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  };
  
  export const Card = ({ children, className = "" }) => {
    return (
      <div className={`bg-white rounded-2xl shadow p-4 ${className}`}>
        {children}
      </div>
    );
  };
  
  export const CardContent = ({ children, className = "" }) => {
    return <div className={`mt-2 ${className}`}>{children}</div>;
  };
  