// Augment express-session to include our custom userId field.
// This file is auto-included via tsconfig "include": ["src/**/*"]
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}
