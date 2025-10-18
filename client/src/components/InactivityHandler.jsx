import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { clearCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';

const InactivityHandler = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [logoutApiCall] = useLogoutMutation();

  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Using refs for timers to avoid issues with closures and re-renders
  const inactivityTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const timeoutDuration = 30 * 60 * 1000; // 30 minutes
  const countdownDuration = 60 * 1000; // 1 minute

  const logout = useCallback(async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(clearCredentials());
      navigate('/login');
      toast.info('You have been logged out due to inactivity.');
    } catch (err) {
      console.error('Failed to log out:', err);
      toast.error('Failed to log out automatically. Please try again.'); // Corrected: User feedback
    }
  }, [logoutApiCall, dispatch, navigate]);

  const clearAllTimers = useCallback(() => {
    clearTimeout(inactivityTimerRef.current);
    clearInterval(countdownIntervalRef.current);
  }, []);

  const handleStayLoggedIn = () => {
    setShowModal(false);
    setCountdown(60);
    clearAllTimers();
    // The main useEffect will now restart the timers because userInfo is still present
  };

  // --- Main Inactivity Timer ---
  useEffect(() => {
    if (!userInfo) {
      // If there is no user, make sure everything is cleared and do nothing else.
      clearAllTimers();
      setShowModal(false);
      return;
    }

    const handleActivity = () => {
      // ONLY reset the timer if the modal is NOT currently showing.
      // This prevents the modal from disappearing on mouse movement.
      if (!showModal) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = setTimeout(() => {
          setShowModal(true);
        }, timeoutDuration);
      }
    };
    
    const activityEvents = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    
    // Add listeners for all activity events.
    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Start the initial timer.
    handleActivity();

    // Cleanup function to remove listeners.
    return () => {
      clearTimeout(inactivityTimerRef.current);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [userInfo, showModal, timeoutDuration, clearAllTimers]);

  // --- The Modal Countdown Timer ---
  useEffect(() => {
    if (!showModal) {
      return;
    }

    // Start the 1-minute timer to automatically log out.
    const logoutTimer = setTimeout(logout, countdownDuration);

    // Start the interval to update the countdown display every second.
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Cleanup function to clear these specific timers if the modal is closed.
    return () => {
      clearTimeout(logoutTimer);
      clearInterval(countdownIntervalRef.current);
    };
  }, [showModal, logout, countdownDuration]);

  if (!showModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-sm p-8 text-center bg-white rounded-lg shadow-xl">
        <h2 className="mb-4 text-2xl font-bold text-gray-800">Are you still there?</h2>
        <p className="mb-6 text-gray-600">
          You will be logged out in{' '}
          <span className="text-lg font-bold">{countdown}</span> seconds due to
          inactivity.
        </p>
        <button
          onClick={handleStayLoggedIn}
          className="px-6 py-2 font-semibold text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Stay Logged In
        </button>
      </div>
    </div>
  );
};

export default InactivityHandler;