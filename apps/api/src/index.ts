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
import { AppError } from "./lib/errors.js";
import type { Request, Response, NextFunction } from "express";

const app = express();
const PORT = process.env.PORT || 4000;

// =============================================================
// Global Middleware
// =============================================================

app.use(cors());
app.use(express.json());

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

app.use("/api/auth", authRouter);
app.use("/api/agencies", agencyRouter);
app.use("/api", tenantRouter);
app.use("/api/tenants", postRouter);
app.use("/api/tenants", categoryRouter);
app.use("/api/tenants", tagRouter);
app.use("/api/tenants", themeRouter);

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
