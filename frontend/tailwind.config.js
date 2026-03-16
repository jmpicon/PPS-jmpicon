/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg:       '#080c18',
          surface:  '#0d1526',
          card:     '#111827',
          border:   '#1e3a5f',
          green:    '#00ff88',
          blue:     '#00d4ff',
          purple:   '#a29bfe',
          red:      '#ff4757',
          orange:   '#ffa502',
          pink:     '#fd79a8',
          text:     '#e2e8f0',
          muted:    '#64748b',
          dim:      '#334155',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow':    'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'glow':          'glow 2s ease-in-out infinite alternate',
        'scan':          'scan 4s linear infinite',
        'float':         'float 6s ease-in-out infinite',
        'fade-in-up':    'fadeInUp 0.5s ease-out forwards',
        'fade-in':       'fadeIn 0.4s ease-out forwards',
        'matrix':        'matrix 20s linear infinite',
      },
      keyframes: {
        glow: {
          from: { boxShadow: '0 0 5px currentColor, 0 0 10px currentColor' },
          to:   { boxShadow: '0 0 10px currentColor, 0 0 25px currentColor, 0 0 50px currentColor' },
        },
        scan: {
          '0%':   { backgroundPosition: '0 -100vh' },
          '35%, 100%': { backgroundPosition: '0 100vh' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        matrix: {
          '0%':   { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 1000px' },
        },
      },
      backgroundImage: {
        'grid-pattern': `
          linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)
        `,
        'cyber-gradient': 'linear-gradient(135deg, #080c18 0%, #0d1526 50%, #080c18 100%)',
      },
      backgroundSize: {
        'grid': '50px 50px',
      },
      boxShadow: {
        'cyber-green':  '0 0 20px rgba(0,255,136,0.3)',
        'cyber-blue':   '0 0 20px rgba(0,212,255,0.3)',
        'cyber-purple': '0 0 20px rgba(162,155,254,0.3)',
        'cyber-red':    '0 0 20px rgba(255,71,87,0.3)',
        'cyber-orange': '0 0 20px rgba(255,165,2,0.3)',
        'cyber-pink':   '0 0 20px rgba(253,121,168,0.3)',
        'card':         '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover':   '0 8px 40px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}
