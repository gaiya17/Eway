const { supabaseAdmin } = require('../config/supabase');

/**
 * Creates an Express middleware that logs an Activity event.
 * @param {string} moduleName — e.g. User Management, Payments, Classes
 */
function activityLog(moduleName) {
  return async (req, res, next) => {
    // Only capture on successful response
    res.on('finish', async () => {
      // We only care about success codes for Activity (e.g., successful login, successful view)
      if (res.statusCode >= 200 && res.statusCode < 400) {
        
        // Exclude frequent/noisy routes if needed, but since we map per-router, we log what comes here.
        // Let's derive action_type from method & path
        const method = req.method;
        const pathStr = req.route ? req.route.path : req.path;
        let actionStr = 'Viewed';
        if (method === 'POST') actionStr = 'Created';
        else if (method === 'PATCH' || method === 'PUT') actionStr = 'Updated';
        else if (method === 'DELETE') actionStr = 'Deleted';

        const actionType = `${actionStr} ${moduleName} resource`;
        
        // Handle specific login route manually for cleanliness
        const finalAction = pathStr.includes('login') ? 'User Login' : actionType;

        const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';

        try {
          await supabaseAdmin.from('system_logs').insert({
            user_id: req.user?.id || null, // req.user populated by verifyToken
            action_type: finalAction,
            entity_name: moduleName,
            old_data: null,
            new_data: { path: req.originalUrl, method: req.method },
            ip_address: ip,
            log_type: 'Activity'
          });
        } catch (err) {
          console.error('ACTIVITY REGISTRY ERROR:', err.message);
        }
      }
    });

    next();
  };
}

module.exports = { activityLog };
