/**
 * Authentication Controller
 * Handles user registration, bcrypt password hashing, and JWT token issuance.
 * Course Outcome: CO-2, CO-4, CO-6
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.full_name, organization: user.organization },
    process.env.JWT_SECRET || 'motorvibe_industrial_secret_key_2026_super_secure',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
}

/**
 * Register a new user
 * POST /api/auth/signup (also aliased to /api/auth/register)
 */
async function register(req, res, next) {
  try {
    const { full_name, email, password, confirm_password, organization, role } = req.body;

    // Validation
    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    if (confirm_password && password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already registered
    const existing = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    // Hash password securely with bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const userRole = role === 'admin' ? 'admin' : 'engineer';
    const userOrg = organization ? organization.trim() : 'MotorVibe Industrial Plant';

    // Insert user into PostgreSQL using parameterized query
    const insertRes = await query(
      `INSERT INTO users (full_name, email, password_hash, organization, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, organization, role, created_at`,
      [full_name.trim(), normalizedEmail, passwordHash, userOrg, userRole]
    );

    const newUser = insertRes.rows[0];
    const token = generateToken(newUser);

    // Audit log
    await query(
      `INSERT INTO activity_logs (user_id, action, description)
       VALUES ($1, 'USER_REGISTERED', $2)`,
      [newUser.id, `User ${newUser.full_name} (${newUser.email}) registered successfully.`]
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to MotorVibe.',
      token,
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Authenticate existing user
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Query user by email
    const userRes = await query(
      'SELECT id, full_name, email, password_hash, organization, role, created_at FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const user = userRes.rows[0];

    // Verify hashed password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password combination.',
      });
    }

    const token = generateToken(user);

    // Audit log
    await query(
      `INSERT INTO activity_logs (user_id, action, description)
       VALUES ($1, 'USER_LOGGED_IN', $2)`,
      [user.id, `User ${user.full_name} logged into MotorVibe dashboard.`]
    );

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        organization: user.organization,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Logout user
 * POST /api/auth/logout
 */
async function logout(req, res) {
  return res.status(200).json({
    success: true,
    message: 'User logged out successfully.',
  });
}

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
async function getMe(req, res, next) {
  try {
    const userRes = await query(
      'SELECT id, full_name, email, organization, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User session not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user: userRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user profile
 * PUT /api/auth/profile
 */
async function updateProfile(req, res, next) {
  try {
    const { full_name, organization } = req.body;
    if (!full_name) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }

    const updateRes = await query(
      `UPDATE users 
       SET full_name = $1, organization = COALESCE($2, organization)
       WHERE id = $3
       RETURNING id, full_name, email, organization, role, created_at`,
      [full_name.trim(), organization ? organization.trim() : null, req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updateRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
};
