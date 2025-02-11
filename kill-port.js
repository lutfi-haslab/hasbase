import { exec } from "child_process";

const port = 8008;

// Command to find the process using the port
const findProcessCommand = process.platform === "win32"
  ? `netstat -ano | findstr :${port}`
  : `lsof -i :${port} | grep LISTEN`;

exec(findProcessCommand, (err, stdout) => {
  if (err || !stdout) {
    console.log(`No process found running on port ${port}`);
    return;
  }

  // Extract the process ID (PID)
  const pid = process.platform === "win32"
    ? stdout.trim().split(/\s+/).pop()
    : stdout.split(/\s+/)[1];

  if (!pid) {
    console.log(`Could not determine PID for port ${port}`);
    return;
  }

  console.log(`Killing process ${pid} on port ${port}...`);

  // Kill the process
  const killCommand = process.platform === "win32"
    ? `taskkill /PID ${pid} /F`
    : `kill -9 ${pid}`;

  exec(killCommand, (killErr) => {
    if (killErr) {
      console.log(`Failed to kill process ${pid}:`, killErr);
    } else {
      console.log(`Process ${pid} killed successfully`);
    }
  });
});