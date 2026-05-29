# 💼 Job Tracker

A full-stack web application to manage and track job applications efficiently.

## 🚀 Features

- Add, update, and delete job applications
- Track application status (Applied, Interview, Offer, Rejected)
- User authentication & session management
- Responsive UI

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Frontend:** EJS, CSS
- **Auth:** Express-session / bcrypt

## ⚙️ Installation

```bash
git clone https://github.com/ShraddhaMutange/Job-Tracker.git
cd Job-Tracker
npm install
```

Create a `.env` file:

```
PORT=3000
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_secret_key
```

```bash
npm start
```

## 📁 Project Structure

job-tracker/
├── middleware/ # Auth middleware
├── models/ # Mongoose schemas
├── routes/ # Express routes
├── views/ # EJS templates
├── public/ # Static assets
└── app.js # Entry point

## 👩‍💻 Author

Shraddha Mutange
