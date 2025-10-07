import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSocket } from '../context/SocketContext';
import { useGetCourseMessagesQuery } from '../slices/chatApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';
import { FaPaperPlane } from 'react-icons/fa';

const ChatScreen = () => {
  const { courseId } = useParams();
  const { userInfo } = useSelector((state) => state.auth);
  const socket = useSocket();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const { data: initialMessages, isLoading, error } = useGetCourseMessagesQuery(courseId);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (socket) {
      socket.emit('joinCourse', courseId);

      const handleNewMessage = (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      };

      socket.on('newMessage', handleNewMessage);

      return () => {
        socket.off('newMessage', handleNewMessage);
      };
    }
  }, [socket, courseId]);

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

  const handleKeyDown = (e) => {
    // Pressing Enter alone sends message, Shift+Enter adds a new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div>
      <Meta title="Course Chat | Lectern" />
      <Link
        to={`/course/${courseId}`}
        className="inline-block px-4 py-2 mb-6 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
      >
        Back to Course
      </Link>
      <div className="flex flex-col bg-white rounded-lg shadow-md h-[calc(100vh-200px)]">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Course Chat Room</h1>
        </div>
        <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto">
          {isLoading ? (
            <Loader />
          ) : error ? (
            <Message variant="error">{error?.data?.message || error.error}</Message>
          ) : messages.length === 0 ? (
            <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isMyMessage = msg.sender?._id === userInfo._id;
                const senderName = msg.sender?.name ?? 'Deleted User';
                const senderImage =
                  msg.sender?.profileImage ||
                  `https://ui-avatars.com/api/?name=${senderName.split(' ').join('+')}&background=d1d5db&color=6b7280`;

                return (
                  <div
                    key={msg._id}
                    className={`flex items-end gap-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMyMessage && (
                      <img
                        src={senderImage}
                        alt={senderName}
                        title={senderName}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div
                      className={`max-w-xs p-3 rounded-lg md:max-w-md ${
                        isMyMessage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {!isMyMessage && (
                        <p className="mb-1 text-xs font-bold opacity-70">{senderName}</p>
                      )}
                      <p className="text-sm whitespace-pre-line">{msg.content}</p>
                      {msg.createdAt && (
                        <p className="mt-1 text-[10px] opacity-50">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                    {isMyMessage && (
                      <img
                        src={
                          userInfo.profileImage ||
                          `https://ui-avatars.com/api/?name=${userInfo.name.split(' ').join('+')}`
                        }
                        alt={userInfo.name}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Shift + Enter for new line)"
              className="w-full px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="1"
            />
            <button
              type="submit"
              className="flex items-center px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              aria-label="Send Message"
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
