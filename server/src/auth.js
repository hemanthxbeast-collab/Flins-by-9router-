import jwt from 'jsonwebtoken';
const secret = () => process.env.JWT_SECRET || 'development-only-change-this-secret-at-least-32-chars';
export const issueToken = (user) => jwt.sign({ sub: user.id, email: user.email }, secret(), { expiresIn: '8h', issuer: 'flins-api', audience: 'flins-client' });
export function requireAuth(req, res, next) {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: { code: 'AUTH_REQUIRED', message: 'Sign in to use Flins.' } });
  try { req.user = jwt.verify(token, secret(), { issuer: 'flins-api', audience: 'flins-client' }); return next(); }
  catch { return res.status(401).json({ error: { code: 'INVALID_SESSION', message: 'Your session is invalid or has expired.' } }); }
}
