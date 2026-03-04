import { Router, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { prisma } from "@repo/db";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// =============================================================
// Config
// =============================================================

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    "application/pdf",
];
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// =============================================================
// Multer Config
// =============================================================

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Tipo não permitido: ${file.mimetype}. Formatos aceitos: JPEG, PNG, WebP, GIF, SVG, PDF`));
        }
    },
});

// =============================================================
// POST /api/tenants/:tenantId/media
// =============================================================

router.post(
    "/:tenantId/media",
    authenticate,
    upload.single("file"),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tenantId = req.params.tenantId as string;

            if (!req.file) {
                res.status(400).json({ error: "Nenhum arquivo enviado" });
                return;
            }

            const tenant = await prisma.tenant.findUnique({
                where: { id: tenantId },
            });

            if (!tenant) {
                res.status(404).json({ error: "Tenant não encontrado" });
                return;
            }

            const fileId = crypto.randomUUID();
            const ext = path.extname(req.file.originalname).toLowerCase() || ".bin";
            const isImage = IMAGE_TYPES.includes(req.file.mimetype);

            let filename: string;
            let fileBuffer = req.file.buffer;
            let width: number | undefined;
            let height: number | undefined;
            let fileSize = req.file.size;

            if (isImage) {
                // Optimize image: resize to max 1920px, convert to WebP
                const image = sharp(req.file.buffer);
                const metadata = await image.metadata();
                width = metadata.width;
                height = metadata.height;

                // Resize if larger than 1920px
                if (width && width > 1920) {
                    fileBuffer = await image
                        .resize(1920, undefined, { withoutEnlargement: true })
                        .webp({ quality: 82 })
                        .toBuffer();
                    filename = `${fileId}.webp`;
                } else {
                    fileBuffer = await image.webp({ quality: 85 }).toBuffer();
                    filename = `${fileId}.webp`;
                }

                fileSize = fileBuffer.length;

                // Update dimensions after resize
                const resizedMeta = await sharp(fileBuffer).metadata();
                width = resizedMeta.width;
                height = resizedMeta.height;
            } else {
                filename = `${fileId}${ext}`;
            }

            // Save to disk — in production, this would go to Cloudflare R2 / S3
            const tenantDir = path.join(UPLOAD_DIR, tenantId);
            if (!fs.existsSync(tenantDir)) {
                fs.mkdirSync(tenantDir, { recursive: true });
            }

            const filePath = path.join(tenantDir, filename);
            fs.writeFileSync(filePath, fileBuffer);

            // Save to database
            const media = await prisma.media.create({
                data: {
                    tenantId,
                    filename,
                    originalName: req.file.originalname,
                    mimeType: isImage ? "image/webp" : req.file.mimetype,
                    size: fileSize,
                    url: `/uploads/${tenantId}/${filename}`,
                    width: width || null,
                    height: height || null,
                },
            });

            res.status(201).json({
                id: media.id,
                url: media.url,
                filename: media.filename,
                originalName: media.originalName,
                mimeType: media.mimeType,
                size: media.size,
                width: media.width,
                height: media.height,
            });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// GET /api/tenants/:tenantId/media
// =============================================================

router.get(
    "/:tenantId/media",
    authenticate,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tenantId = req.params.tenantId as string;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;

            const [media, total] = await Promise.all([
                prisma.media.findMany({
                    where: { tenantId },
                    orderBy: { createdAt: "desc" },
                    skip: (page - 1) * limit,
                    take: limit,
                }),
                prisma.media.count({ where: { tenantId } }),
            ]);

            res.json({
                data: media,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            });
        } catch (error) {
            next(error);
        }
    },
);

// =============================================================
// DELETE /api/tenants/:tenantId/media/:mediaId
// =============================================================

router.delete(
    "/:tenantId/media/:mediaId",
    authenticate,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tenantId = req.params.tenantId as string;
            const mediaId = req.params.mediaId as string;

            const media = await prisma.media.findFirst({
                where: { id: mediaId, tenantId },
            });

            if (!media) {
                res.status(404).json({ error: "Mídia não encontrada" });
                return;
            }

            // Delete file from disk
            const filePath = path.join(UPLOAD_DIR, tenantId, media.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            // Delete from database
            await prisma.media.delete({ where: { id: mediaId } });

            res.json({ deleted: true });
        } catch (error) {
            next(error);
        }
    },
);

export default router;
