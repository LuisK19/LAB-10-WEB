const jwt = require('jsonwebtoken');
const supabase = require('../models/supabaseClient');

const login = async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Username and password are required',
        timestamp: new Date().toISOString(),
        path: req.path
      }
    });
  }

  try {
    // Buscar usuario en Supabase
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
    }

    // Comparar contraseña (en un caso real, debería estar hasheada)
    if (user.password !== password) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
    }

    // Generar JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login
};