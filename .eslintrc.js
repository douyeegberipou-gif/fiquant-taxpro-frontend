module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Disable some rules that might cause build failures
    'no-unused-vars': 'warn',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'no-console': 'off'
  },
  overrides: [
    {
      files: ['**/*.js', '**/*.jsx'],
      rules: {
        // Allow console logs in development
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      },
    },
  ],
};