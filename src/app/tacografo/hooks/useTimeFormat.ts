export function useTimeFormat() {
  const formatTimeInput = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length === 0) return '';
    if (numbers.length <= 3) return numbers;
    
    const minutes = numbers.slice(0, -2);
    const seconds = numbers.slice(-2);
    
    const secs = parseInt(seconds);
    if (secs >= 60) {
      return `${minutes}:59`;
    }
    
    return `${minutes}:${seconds}`;
  };

  return { formatTimeInput };
} 