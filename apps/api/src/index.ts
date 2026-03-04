import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import agencyRouter from "./routes/agency.js";
import tenantRouter from "./routes/tenant.js";
import postRouter from "./routes/post.js";
import categoryRouter from "./routes/category.js";
import tagRouter from "./routes/tag.js";
import themeRouter from "./routes/theme.js";
import homepageRouter from "./routes/homepage.js";
import brandingRouter from "./routes/branding.js";
import billingRouter from "./routes/billing.js";
import webhookRouter from "./routes/webhook.js";
import mediaRouter from "./routes/media.js";
import { authLimiter } from "./middleware/rateLimit.js";
import { auditLog } from "./middleware/auditLog.js";
import { AppError } from "./lib/errors.js";
import type { Request, Response, NextFunction } from "express";

const app = express();
const PORT = process.env.PORT || 4000;

// =============================================================
// Global Middleware
// =============================================================

app.use(cors());
app.use(express.json());

// Serve uploaded files
import path from "path";
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

// Security headers
app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    next();
});

// Audit log for mutating requests
app.use(auditLog);

// =============================================================
// Health Check
// =============================================================

app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "blog-api",
    });
});

// =============================================================
// Routes
// =============================================================

app.use("/api/auth", authLimiter, authRouter);
app.use("/api/agencies", agencyRouter);
app.use("/api", tenantRouter);
app.use("/api/tenants", postRouter);
app.use("/api/tenants", categoryRouter);
app.use("/api/tenants", tagRouter);
app.use("/api/tenants", themeRouter);
app.use("/api/tenants", homepageRouter);
app.use("/api/agencies", brandingRouter);
app.use("/api/agencies", billingRouter);
app.use("/webhooks", webhookRouter);
app.use("/api/tenants", mediaRouter);

// =============================================================
// Error Handler
// =============================================================

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
        const response: Record<string, unknown> = {
            error: err.message,
            statusCode: err.statusCode,
        };

        // Include validation errors if present
        if ("errors" in err) {
            response["validationErrors"] = (err as { errors: unknown }).errors;
        }

        res.status(err.statusCode).json(response);
        return;
    }

    console.error("Unhandled error:", err);
    res.status(500).json({
        error: "Internal server error",
        statusCode: 500,
    });
});

// =============================================================
// Start Server
// =============================================================

app.listen(PORT, () => {
    console.log(`🚀 API server running on http://localhost:${PORT}`);
});
