import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

// Ensure .env is loaded (in case it wasn't loaded in index.ts)
dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });

const router = express.Router();

// Google OAuth Strategy (only if credentials are provided)
// Debug: Check environment variables
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

console.log('🔍 Debug Google OAuth:');
console.log('  GOOGLE_CLIENT_ID exists:', !!googleClientId);
console.log('  GOOGLE_CLIENT_ID length:', googleClientId?.length || 0);
console.log('  GOOGLE_CLIENT_SECRET exists:', !!googleClientSecret);
console.log('  GOOGLE_CLIENT_SECRET length:', googleClientSecret?.length || 0);

const hasGoogleOAuth = googleClientId && 
                       googleClientSecret && 
                       googleClientId.trim() !== '' && 
                       googleClientSecret.trim() !== '';

if (hasGoogleOAuth) {
  try {
    const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5001}`;
    const callbackURL = `${serverUrl}/api/auth/google/callback`;

    console.log('📝 Initializing Google OAuth strategy...');
    console.log('  Callback URL:', callbackURL);

    passport.use('google', new GoogleStrategy({
      clientID: googleClientId.trim(),
      clientSecret: googleClientSecret.trim(),
      callbackURL: callbackURL
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        
        if (!user) {
          user = await User.findOne({ email: profile.emails?.[0]?.value });
          if (user) {
            user.googleId = profile.id;
            await user.save();
          } else {
            user = await User.create({
              email: profile.emails?.[0]?.value || '',
              name: profile.displayName,
              googleId: profile.id
            });
          }
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
    
    // Verify strategy was registered - wait a bit for passport to register it
    setTimeout(() => {
      const strategyRegistered = passport._strategies && 
                                 (passport._strategies.google || passport._strategies['google']);
      if (strategyRegistered) {
        console.log('✅ Google OAuth стратегия успешно инициализирована и зарегистрирована');
        console.log('   Available strategies:', Object.keys(passport._strategies));
      } else {
        console.error('❌ Google OAuth стратегия создана, но не зарегистрирована в passport');
        console.error('   Available strategies:', Object.keys(passport._strategies || {}));
      }
    }, 100);
  } catch (error) {
    console.error('❌ Ошибка инициализации Google OAuth:', error);
  }
} else {
  console.log('⚠️  Google OAuth не настроен. GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET не указаны или пустые в .env');
  console.log('   Убедитесь, что переменные указаны в server/.env файле и перезапустите сервер');
}

passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await User.create({ email, password, name });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user (verify token and return user info)
router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Google OAuth routes
router.get('/google', (req: Request, res: Response, next: any) => {
  // Check if Google OAuth is configured
  const hasGoogleOAuth = process.env.GOOGLE_CLIENT_ID && 
                         process.env.GOOGLE_CLIENT_SECRET && 
                         process.env.GOOGLE_CLIENT_ID.trim() !== '' && 
                         process.env.GOOGLE_CLIENT_SECRET.trim() !== '';
  
  if (!hasGoogleOAuth) {
    return res.status(503).json({ 
      error: 'Google OAuth не настроен. Пожалуйста, укажите GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET в .env файле. См. GOOGLE_OAUTH_SETUP.md для инструкций.',
      hint: 'Если вы не планируете использовать Google OAuth, используйте обычную регистрацию по email/password.'
    });
  }
  
  // Check if strategy is actually registered
  // Use a safer way to check strategy existence
  const strategyExists = passport._strategies && 
                         (passport._strategies.google || passport._strategies['google']);
  
  if (!strategyExists) {
    console.error('❌ Google OAuth strategy not found in passport._strategies');
    console.error('   Available strategies:', Object.keys(passport._strategies || {}));
    console.error('   GOOGLE_CLIENT_ID present:', !!process.env.GOOGLE_CLIENT_ID);
    console.error('   GOOGLE_CLIENT_SECRET present:', !!process.env.GOOGLE_CLIENT_SECRET);
    console.error('   GOOGLE_CLIENT_ID value:', process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...' : 'NOT SET');
    
    // Try to re-initialize if credentials exist
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      console.log('🔄 Attempting to re-initialize Google OAuth strategy...');
      // This shouldn't happen, but if it does, we'll log it
    }
    
    return res.status(503).json({ 
      error: 'Google OAuth стратегия не инициализирована. Проверьте настройки в .env файле и перезапустите сервер.',
      hint: 'Убедитесь, что GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET указаны правильно в server/.env и перезапустите сервер.',
      debug: {
        hasClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        availableStrategies: Object.keys(passport._strategies || {}),
        note: 'Проверьте логи сервера при запуске для отладочной информации'
      }
    });
  }
  
  try {
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  } catch (error: any) {
    console.error('Error in Google OAuth authentication:', error);
    return res.status(503).json({ 
      error: 'Ошибка при инициализации Google OAuth. Проверьте настройки и перезапустите сервер.'
    });
  }
});

router.get('/google/callback',
  (req: Request, res: Response, next: any) => {
    const hasGoogleOAuth = process.env.GOOGLE_CLIENT_ID && 
                           process.env.GOOGLE_CLIENT_SECRET && 
                           process.env.GOOGLE_CLIENT_ID.trim() !== '' && 
                           process.env.GOOGLE_CLIENT_SECRET.trim() !== '';
    
    if (!hasGoogleOAuth || !passport._strategies || !passport._strategies.google) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_not_configured`);
    }
    
    passport.authenticate('google', { session: false }, (err: any, user: any, info: any) => {
      if (err) {
        console.error('Google OAuth error:', err);
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_failed`);
      }
      if (!user) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_failed`);
      }
      
      try {
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?token=${token}`);
      } catch (error) {
        console.error('Token generation error:', error);
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=token_failed`);
      }
    })(req, res, next);
  }
);

export default router;

