# MongoDB Connection Troubleshooting

It seems like your backend cannot connect to a local MongoDB instance. This usually happens because:
1.  MongoDB is not installed.
2.  MongoDB is installed but the server is not running.
3.  The connection string in `.env` is incorrect.

## How to Fix

### Option 1: Start Local MongoDB (If Installed)
1.  Open Task Manager or Services (press `Win + R`, type `services.msc`) and look for a service named **MongoDB Server**.
2.  Right-click and select **Start**.
3.  If you don't find it, try running this command in a new terminal window:
    ```powershell
    mongod
    ```
    If this command works, keep that terminal window open while you run your backend.

### Option 2: Install MongoDB Community Server
1.  Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community) for Windows.
2.  During installation, choose "Run service as Network Service user" (default).
3.  Complete installation and try running `npm start` again.

### Option 3: Use MongoDB Atlas (Cloud Database)
1.  Create a free account on [MongoDB Atlas](https://www.mongodb.com/atlas).
2.  Create a new cluster (free tier).
3.  Get your connection string (looks like `mongodb+srv://<username>:<password>@cluster0.exammple.mongodb.net/?retryWrites=true&w=majority`).
4.  Update the `MONGO_URI` in `backend/.env`:
    ```env
    MONGO_URI=your_connection_string_here
    ```
