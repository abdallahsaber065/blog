// lib/apiError.ts
// Centralized helpers for consistent API response shapes.
// Error:   { error: string }
// Success: the data directly (entity, array, or { message })

import { NextApiResponse } from 'next';

/**
 * Send a JSON error response and return void so callers can `return apiError(...)`.
 */
export function apiError(
    res: NextApiResponse,
    status: number,
    message: string,
): void {
    res.status(status).json({ error: message });
}

/**
 * Send a 405 Method Not Allowed response with the correct Allow header.
 */
export function methodNotAllowed(
    res: NextApiResponse,
    allowed: string[] = ['GET', 'POST', 'PUT','PATCH', 'DELETE'],
): void {
    res.setHeader('Allow', allowed);
    res.status(405).json({ error: `Method not allowed. Allowed: ${allowed.join(', ')}` });
}
