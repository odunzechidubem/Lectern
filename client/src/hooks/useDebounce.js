import { useState, useEffect } from 'react';

// This custom hook takes a value and a delay time.
// It will only return the latest value after the user has stopped typing for the specified delay.
function useDebounce(value, delay) {
  // State to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up a timer that will update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value); 
    }, delay);

    // This is the cleanup function. It runs every time the `value` changes.
    // It cancels the previous timer, ensuring that only the timer for the most recent value runs.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-run the effect if value or delay changes

  return debouncedValue;
}

export default useDebounce;