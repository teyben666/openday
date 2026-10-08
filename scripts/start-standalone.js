/**
 * Start the production standalone server bound to all interfaces.
 * Use this (not `npm run dev`) when sharing via a public domain / tunnel.
 */
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '3210';
process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

require('../.next/standalone/server.js');
