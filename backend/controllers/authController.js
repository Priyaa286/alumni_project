// Centralized Demo Credentials Configuration
const DEMO_USERS = [
  {
    email: 'admin@nec.edu',
    password: 'admin123',
    role: 'admin',
    name: 'NEC Admin',
  },
  {
    email: 'user@nec.edu',
    password: 'user123',
    role: 'user',
    name: 'NEC Nominator',
  }
];

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const foundUser = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === password
    );

    if (!foundUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Return user info and demo token for security header verification
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: `demo-token-${foundUser.role}`,
      user: {
        email: foundUser.email,
        role: foundUser.role,
        name: foundUser.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred during login'
    });
  }
};
