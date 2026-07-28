# Taskify 🗂️

A full-stack Task Management Web Application built with **Node.js**, **Express**, **MongoDB Atlas**, and **EJS**. Taskify provides secure user authentication, persistent session management, and full task CRUD functionality with an intuitive UI.

🌐 **Live Demo**: [https://taskify-qzdh.onrender.com](https://taskify-qzdh.onrender.com)

---

## 🚀 Features

- 🔐 **User Authentication**: Secure signup, login, and session-based authentication using `bcryptjs` and `express-session`.
- 📋 **Personalized Task Management**: User-isolated task dashboard — users only see and manage their own tasks.
- ✏️ **Full CRUD Operations**: Create, view, edit, update status, and delete tasks.
- 🏷️ **Status Tracking**: Categorize tasks by status (*Pending*, *In Progress*, *Completed*) with visual badges.
- 💾 **Persistent Session Store**: Powered by `connect-mongo` to keep users authenticated across deployment restarts.
- 📱 **Responsive UI**: Built with EJS, `ejs-mate` layouts, Bootstrap, and custom CSS styling.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, Bootstrap 5, EJS, EJS-Mate |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Authentication & Sessions** | Bcrypt.js, Express-Session, Connect-Mongo |
| **Deployment** | Render (Web Service), MongoDB Atlas (Cloud Database) |

---

## 🔑 Environment Variables

To run this project, configure the following environment variables in a `.env` file at the root directory:

```env
MONGO_URL=mongodb+srv://<username>:<password>@cluster0.whzfqsa.mongodb.net/taskify?retryWrites=true&w=majority
PORT=8080
SECRET=your_super_secret_session_key
```

---

## ⚙️ Local Setup Instructions

Follow these steps to set up and run Taskify on your local machine:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/priyal-codes/taskify.git
   cd taskify
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   Create a `.env` file in the project root:
   ```env
   MONGO_URL=mongodb://127.0.0.1:27017/taskify
   PORT=8080
   SECRET=development_secret_key
   ```

4. **Start the Application**
   ```bash
   npm start
   ```

5. **Open in Browser**
   Navigate to [http://localhost:8080](http://localhost:8080) in your web browser.

---

## 🧾 Screenshots

<div align="center">

### Home Page
<img width="900" alt="Home Page" src="https://github.com/user-attachments/assets/77f3f35d-7fee-4a40-ae83-631cadcd8baa" />

### Task List
<img width="900" alt="Task List" src="https://github.com/user-attachments/assets/599349b5-7931-45be-9db9-06c14cdcfc74" />

### Task Details
<img width="900" alt="Task Details" src="https://github.com/user-attachments/assets/de988697-6b57-4b06-9fab-8632c57227f5" />

</div>

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
