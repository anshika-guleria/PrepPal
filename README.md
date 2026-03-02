<h1 align="center">🚀 PrepPal</h1>
<h3 align="center">Real-Time Study Collaboration Platform</h3>

<p align="center">
  A full-stack real-time chat and video calling platform built for students.
</p>

<hr/>

<h2>✨ Features</h2>
<ul>
  <li>🔐 JWT Authentication (Login / Register)</li>
  <li>👥 Friend Requests & Suggestions</li>
  <li>💬 Real-Time 1–1 Chat using Socket.IO</li>
  <li>📎 File & PDF Upload (Cloudinary)</li>
  <li>📹 Peer-to-Peer Video Calling (WebRTC)</li>
  <li>🌗 Multiple Themes</li>
  <li>🔒 Protected Routes</li>
</ul>

<hr/>

<h2>🏗 Tech Stack</h2>

<h3>💻 Frontend</h3>
<ul>
  <li>React (Vite)</li>
  <li>TailwindCSS</li>
  <li>Socket.IO Client</li>
  <li>WebRTC</li>
  <li>Axios</li>
  <li>Context API</li>
</ul>

<h3>🖥 Backend</h3>
<ul>
  <li>Node.js</li>
  <li>Express.js</li>
  <li>MongoDB + Mongoose</li>
  <li>Socket.IO</li>
  <li>JWT Authentication</li>
  <li>Cloudinary</li>
  <li>Multer</li>
</ul>

<hr/>

<h2>📂 Project Structure</h2>

<pre>
PrepPal/
 ├── backend/
 └── frontend/
</pre>

<hr/>

<h2>🔐 Environment Variables</h2>

<h3>Backend (.env)</h3>
<pre>
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
</pre>

<h3>Frontend (.env)</h3>
<pre>
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
</pre>

<hr/>

<h2>⚙️ Installation</h2>

<h3>Clone the Repository</h3>
<pre>
git clone https://github.com/ans53/PrepPal.git
cd PrepPal
</pre>

<h3>Backend Setup</h3>
<pre>
cd backend
npm install
npm run dev
</pre>

<h3>Frontend Setup</h3>
<pre>
cd frontend
npm install
npm run dev
</pre>

<hr/>

<h2>🎯 Purpose</h2>
<p>
PrepPal was built to provide students with a seamless environment 
to chat, collaborate, and prepare together in real-time.
</p>

<hr/>

<p align="center">
  ⭐ If you like this project, consider giving it a star!
</p>
