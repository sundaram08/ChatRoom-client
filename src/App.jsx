import { useState,useEffect,useRef } from 'react'
import './App.css'
import { FaPaperPlane } from 'react-icons/fa';
import {io}  from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';


function App() {
  const socket = io.connect('https://chat-room-api-iota.vercel.app');
  const bottomRef = useRef(null);
  const [message, setMessage] = useState(null);
  const[chats,setChats] = useState([]);
  const [username, setUsername] = useState(localStorage.getItem('CRusername') || '');


  useEffect(() => {
    socket.removeAllListeners('receiveMessage');
    socket.on('receiveMessage', (newMessage, user) => {
      console.log('Received Meassage',newMessage);
      setChats((prevChats) => [...prevChats,{ message: newMessage, _id:uuidv4(), username:user}]);
    });
  }, []);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };
  
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleSubmit= async (e)=>{
    e.preventDefault();
    try {
      const response = await fetch(`https://chat-room-api-iota.vercel.app/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({message, username}),
      });
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to submit data: ${errorMessage}`);
      }
      console.log('Data submitted successfully');
      socket.emit('sendMessage', {message, username});
      document.getElementById('messageInput').value = '';
      setMessage('')
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  }
   
  const fetchData = async () => {
    try {
      const response = await fetch('https://chat-room-api-iota.vercel.app/chat',{

    });
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); 

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('CRusername', username);
  }, [username]);

 
  return (
    <>
    <div className='bg-gray-700 w-screen h-screen flex flex-col'>

    <div className='border border-white mx-4 mt-2 rounded-md flex overflow-y-auto h-10 w-80'>
        <input value={username} onChange={handleUsernameChange} className='px-4 py-2 focus:outline-none bg-slate-600' type="text" placeholder='write your username' />
        <button className='py-2 px-4 rounded inline-block lg:text-xl bg-slate-400 hover:bg-slate-200 bg-cover '>Submit</button>
    </div>

    <div className='border border-white mx-4 mt-2 rounded-md flex-1 overflow-y-auto'>
      <ul className='flex flex-col'>
        {chats.map((chat) => (
          <li key={chat._id} className="bg-gray-500 rounded-lg p-1 m-1 inline-block max-w-full" style={{ width: `${Math.max(chat.username.length * 10, chat.message.length * 10)}px` }}>
            <h5>{chat.username}</h5>
            <p className="text-white mt-2" >{chat.message}</p>
          </li>
        ))}
           <div ref={bottomRef} />
      </ul>
      </div>


      <div className='border border-white rounded-md mx-4 my-2 flex items-center'>
        <input  id="messageInput" onKeyDown={(e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  }} onChange={handleInputChange}  className='flex-1 px-4 py-2  focus:outline-none bg-slate-600' type="text" placeholder="Type your message..." />
        <button onClick={handleSubmit} className='py-2 px-4 rounded inline-block mr-2 lg:text-xl bg-slate-400 hover:bg-slate-200 bg-cover'><FaPaperPlane /></button>
      </div>
    </div>
    </>
  )
}

export default App
