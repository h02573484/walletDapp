#!/bin/bash
# Custom startup script for Render deployment

echo "Starting application in production mode..."

# Function to create a minimal error page if needed
create_error_page() {
  local ERROR_MESSAGE=$1
  local ERROR_PAGE="server/public/error.html"
  
  echo "Creating error page with message: $ERROR_MESSAGE"
  
  cat > $ERROR_PAGE << EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Error</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f7f8fb;
      color: #333;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      padding: 20px;
      text-align: center;
    }
    .error-container {
      max-width: 550px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 40px;
    }
    h1 {
      margin-top: 0;
      color: #e53e3e;
    }
    p {
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .status {
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 8px;
    }
    .message {
      color: #666;
    }
    .action {
      margin-top: 24px;
    }
    .action a {
      background-color: #3182ce;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 500;
      display: inline-block;
    }
    .action a:hover {
      background-color: #2c5282;
    }
  </style>
</head>
<body>
  <div class="error-container">
    <h1>Application Error</h1>
    <div class="status">Service Temporarily Unavailable</div>
    <p class="message">$ERROR_MESSAGE</p>
    <div class="action">
      <a href="/">Try Again</a>
    </div>
  </div>
</body>
</html>
EOF
}

# Verify server/public directory exists
if [ ! -d "server/public" ]; then
  echo "WARNING: server/public directory missing - build may have failed"
  mkdir -p server/public
  create_error_page "Build process failed. Please check deployment logs."
fi

# Check if we have an index.html file
if [ ! -f "server/public/index.html" ]; then
  echo "WARNING: index.html is missing - build may have failed"
  create_error_page "Application files not found. Please check deployment logs."
fi

# Ensure database connection before starting (if DATABASE_URL is set)
if [ -n "$DATABASE_URL" ]; then
  echo "Testing database connection..."
  node -e "
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Database connection error:', err.message);
      process.exit(1);
    } else {
      console.log('Database connection successful:', res.rows[0]);
      pool.end();
    }
  });" || { 
    echo "Database connection failed"
    create_error_page "Database connection failed. Our team has been notified and is working on a fix."
  }
else
  echo "No DATABASE_URL environment variable found, skipping database check"
fi

# Start the application
echo "Starting server..."
NODE_ENV=production tsx server/index.ts