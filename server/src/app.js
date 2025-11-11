import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import orderRoutes from "./routes/order.routes.js";
import staffRoutes from "./routes/staff.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ✅ Default route
app.get("/", (req, res) => {
  res.json({ message: "🚀 Server is running" });
});

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);

// ✅ 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
