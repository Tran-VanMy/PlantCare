// server/src/app.js
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
import plantsRoutes from "./routes/plants.routes.js";
import voucherRoutes from "./routes/voucher.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import incidentRoutes from "./routes/incident.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ chỉ log request lỗi / không phải 304
app.use(
  morgan("dev", {
    skip: (req, res) => res.statusCode === 304,
  })
);

app.get("/", (req, res) => res.json({ message: "🚀 Server is running" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);

// orders & customers
app.use("/api/orders", orderRoutes);
app.use("/api", orderRoutes);

// staff/admin/assignments
app.use("/api/staff", staffRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/assignments", assignmentRoutes);

// notifications/chat
app.use("/api/notifications", notificationRoutes);

// payments (đơn luôn thành công như yêu cầu)
app.use("/api/payments", paymentRoutes);

// plants
app.use("/api", plantsRoutes);

// vouchers/reviews/incidents
app.use("/api/vouchers", voucherRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/incidents", incidentRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: "Endpoint not found" }));

app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
