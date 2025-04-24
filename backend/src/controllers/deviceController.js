import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "redis", // Use the Docker service name
  port: process.env.REDIS_PORT || 6379,
});

export const registerDevice = async (req, res) => {
  const { email, device_id, device_type, ip_address, port } = req.body;

  if (!email || !device_id || !device_type || !ip_address || !port) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  let devices = await redis.get(email);
  devices = devices ? JSON.parse(devices) : [];

  if (devices.length >= 2) {
    return res
      .status(400)
      .json({ message: "User already has two devices registered." });
  }

  devices.push({ device_id, device_type, ip_address, port });

  await redis.set(email, JSON.stringify(devices), "EX", 3600); // Expire after 1 hour

  res.status(201).json({ message: "Device registered successfully." });
};

export const getConnectionInfo = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    // Retrieve the user's registered devices from Redis
    let devices = await redis.get(email);
    devices = devices ? JSON.parse(devices) : [];

    if (devices.length !== 2) {
      return res.status(400).json({ message: "User must have exactly two registered devices." });
    }

    res.json({
      message: "WebSocket connection info retrieved.",
      devices
    });
  } catch (error) {
    console.error("Error retrieving connection info:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteDevices = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }
  try {
    await redis.del(email);
    next();
  } catch (error) {
    console.error("Error deleting devices:", error);
    res.status(500).json({ message: "Server error" });
  }
}