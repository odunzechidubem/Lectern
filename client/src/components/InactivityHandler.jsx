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

  const inactivityTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const timeoutDuration = 5 * 60 * 1000; // 5 minutes
  const countdownDuration = 60 * 1000; // 1 minute

  const logout = useCallback(async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(clearCredentials());
      navigate('/login');
      toast.info('You have been logged out due to inactivity.');
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  }, [logoutApiCall, dispatch, navigate]);

  const clearAllTimers = useCallback(() => {
    clearTimeout(inactivityTimerRef.current);
    clearTimeout(countdownTimerRef.current);
    clearInterval(countdownIntervalRef.current);
  }, []);
  
  const handleStayLoggedIn = () => {
    setShowModal(false);
    setCountdown(60);
    clearAllTimers();
    // The main useEffect will now restart the timers because userInfo is still present
  };

  // --- THIS IS THE FIRST PART OF THE FIX: Main Inactivity Timer ---
  useEffect(() => {
    if (!userInfo) {
      // If there is no user, make sure everything is cleared and do nothing else.
      clearAllTimers();
      setShowModal(false);
      return;
    }

    let inactivityTimer;

    const handleActivity = () => {
      // --- THIS IS THE CRITICAL LOGIC ---
      // ONLY reset the timer if the modal is NOT currently showing.
      // This prevents the modal from disappearing on mouse movement.
      if (!showModal) {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
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

    // Cleanup function to remove listeners when the user logs out.
    return () => {
      clearTimeout(inactivityTimer);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [userInfo, showModal, timeoutDuration]); // `showModal` is now a dependency

  // --- THIS IS THE SECOND PART OF THE FIX: The Modal Countdown Timer ---
  useEffect(() => {
    if (!showModal) {
      return;
    }

    // Start the 1-minute timer to automatically log out.
    const logoutTimer = setTimeout(logout, countdownDuration);
    
    // Start the interval to update the countdown display every second.
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Cleanup function to clear these specific timers if the modal is closed.
    return () => {
      clearTimeout(logoutTimer);
      clearInterval(countdownInterval);
    };
  }, [showModal, logout, countdownDuration]);
  
  if (!showModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Are you still there?</h2>
        <p className="mb-6 text-gray-600">
          You will be logged out in{' '}
          <span className="font-bold text-lg">{countdown}</span> seconds due to
          inactivity.
        </p>
        <button
          onClick={handleStayLoggedIn}
          className="bg-blue-500 text-white font-semibold py-2 px-6 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Stay Logged In
        </button>
      </div>
    </div>
  );
};

export default InactivityHandler;