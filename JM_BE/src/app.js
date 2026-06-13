import 'dotenv/config';
import express              from 'express';
import cors                 from 'cors';
import cookieParser         from 'cookie-parser';
import connectDB            from './config/db.js';
import { mongoSanitizer, xssSanitizer } from './middlewares/sanitizer.middleware.js';
import notFound             from './middlewares/notFound.middleware.js';
import errorHandler         from './middlewares/errorHandler.js';

// Modules
import authRoutes           from './modules/auth/auth.routes.js';
import projectRoutes        from './modules/project/project.routes.js';
import memberRoutes         from './modules/member/member.routes.js';
import folderRoutes         from './modules/folder/folder.routes.js';
import endpointRoutes       from './modules/endpoint/endpoint.routes.js';
import responseRoutes       from './modules/response/response.routes.js';
import toggleRoutes         from './modules/toggle/toggle.routes.js';
import mockRoutes           from './modules/mock/mock.routes.js';
import userRoutes           from './modules/user/user.routes.js';
import changeRequestRoutes    from './modules/changeRequest/changeRequest.routes.js';
import contractVersionRoutes  from './modules/contractVersion/contractVersion.routes.js';
import invitationRoutes       from './modules/invitation/invitation.routes.js';
import adminRoutes            from './modules/admin/admin.routes.js';

const app = express();

// ─── Global Middlewares ───────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(mongoSanitizer);
app.use(xssSanitizer);

// ─── Database ─────────────────────────────────────────────────────────────────

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch {
    next(new Error('Koneksi database gagal'));
  }
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects', memberRoutes);
app.use('/api/projects', folderRoutes);
app.use('/api/projects', endpointRoutes);
app.use('/api/projects', responseRoutes);
app.use('/api/projects', toggleRoutes);
app.use('/api/projects', changeRequestRoutes);
app.use('/api/projects', contractVersionRoutes);

// Invitation — public + auth routes untuk accept/decline undangan project
app.use('/api/invitations', invitationRoutes);

// Admin — superadmin only
app.use('/api/admin', adminRoutes);

// Mock server — diakses via API key, bukan JWT.
// Mount terpisah di /mock agar tidak tercampur dengan route dashboard /api/projects.
app.use('/mock', mockRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

export default app;

