import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { useGetCourseMessagesQuery } from '../slices/chatApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { FaPaperPlane, FaUserTimes } from 'react-icons/fa';

const ChatScreen = () => {
  const { courseId } = useParams();
  const { userInfo } = useSelector((state) => state.auth);

  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const { data: initialMessages, isLoading, error } = useGetCourseMessagesQuery(courseId);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000', { withCredentials: true });
    setSocket(newSocket);
    newSocket.emit('joinCourse', courseId);
    
    const handleNewMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };
    
    newSocket.on('newMessage', handleNewMessage);
    
    return () => {
      newSocket.off('newMessage', handleNewMessage);
      newSocket.disconnect();
    };
  }, [courseId]);

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useLayoutEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      socket.emit('sendMessage', { courseId, content: newMessage });
      setNewMessage('');
    }
  };

  return (
    <div>
      <Link to={`/course/${courseId}`} className="inline-block bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 mb-6">
        Back to Course
      </Link>
      <div className="bg-white shadow-md rounded-lg flex flex-col h-[calc(100vh-200px)]">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Course Chat Room</h1>
        </div>
        
        <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto">
          {isLoading ? <Loader /> : error ? <Message variant="error">{error?.data?.message || error.error}</Message> : (
            <div className="space-y-4">
              {messages.map((msg) => {
                // --- THIS IS THE DEFINITIVE FIX ---
                const isMyMessage = msg.sender?._id === userInfo._id;
                const senderName = msg.sender?.name ?? 'Deleted User';
                const senderImage = msg.sender?.profileImage || `https://ui-avatars.com/api/?name=D+U&background=d1d5db&color=6b7280`;

                return (
                  <div key={msg._id} className={`flex items-end gap-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                    {!isMyMessage && (
                      <img src={senderImage} alt={senderName} title={senderName} className="w-8 h-8 rounded-full" />
                    )}
                    <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${isMyMessage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                      {!isMyMessage && (
                        <p className="text-xs font-bold mb-1 opacity-70">{senderName}</p>
                      )}
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    {isMyMessage && (
                      <img src={userInfo.profileImage || `https://ui-avatars.com/api/?name=${userInfo.name.split(' ').join('+')}`} alt={userInfo.name} className="w-8 h-8 rounded-full" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center">
              <FaPaperPlane />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default ChatScreen;