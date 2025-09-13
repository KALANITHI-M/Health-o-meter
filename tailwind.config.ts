import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          glow: "hsl(var(--secondary-glow))",
        },
        battery: {
          high: "hsl(var(--battery-high))",
          medium: "hsl(var(--battery-medium))",
          low: "hsl(var(--battery-low))",
          'glow-high': "hsl(var(--battery-glow-high))",
          'glow-low': "hsl(var(--battery-glow-low))",
        },
        badge: {
          gold: "hsl(var(--badge-gold))",
          silver: "hsl(var(--badge-silver))",
          bronze: "hsl(var(--badge-bronze))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          purple: "hsl(var(--accent-purple))",
          teal: "hsl(var(--accent-teal))",
          pink: "hsl(var(--accent-pink))",
        },
        alert: {
          danger: "hsl(var(--alert-danger))",
          warning: "hsl(var(--alert-warning))",
          success: "hsl(var(--alert-success))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        'gradient-health': 'var(--gradient-health)',
        'gradient-battery': 'var(--gradient-battery)', 
        'gradient-hero': 'var(--gradient-hero)',
      },
      boxShadow: {
        'battery-glow': 'var(--shadow-battery-glow)',
        'battery-low': 'var(--shadow-battery-low)',
        'card': 'var(--shadow-card)',
        'elevated': 'var(--shadow-elevated)',
      },
      transitionTimingFunction: {
        'smooth': 'var(--transition-smooth)',
        'bounce': 'var(--transition-bounce)',
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "battery-charge": {
          "0%": { width: "0%" },
          "100%": { width: "var(--battery-level)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "var(--shadow-battery-glow)" },
          "50%": { boxShadow: "0 0 30px hsl(var(--battery-glow-high) / 0.9)" },
        },
        "badge-bounce": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "battery-charge": "battery-charge 1.5s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "badge-bounce": "badge-bounce 0.6s ease-in-out",
        "float": "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
