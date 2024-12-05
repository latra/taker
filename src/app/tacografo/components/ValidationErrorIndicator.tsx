interface ValidationErrorIndicatorProps {
  errors: string[];
}

export function ValidationErrorIndicator({ errors }: ValidationErrorIndicatorProps) {
  if (errors.length === 0) return null;

  return (
    <div className="relative group">
      <span className="text-red-500 font-bold cursor-help">!</span>
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block">
        <div className="bg-white border border-red-200 rounded shadow-lg p-2 whitespace-nowrap">
          <ul className="list-disc list-inside text-sm text-red-600">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 