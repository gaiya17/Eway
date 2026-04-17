/**
 * Audit Logger Middleware
 * Writes a record to audit_logs whenever a critical mutation occurs.
 * Usage: router.patch('/approve', auditLog('PAYMENT_APPROVE'), handler)
 */

const { supabaseAdmin } = require('../config/supabase');

/**
 * Creates an Express middleware that logs an audit event.
 * @param {string} actionType — e.g. PAYMENT_APPROVE, ROLE_CHANGE
 * @param {Function} getDetails — optional fn(req, res_body) => { target_entity, old_value, new_value }
 */
function auditLog(actionType, getDetails) {
  return async (req, res, next) => {
    // Capture the original json method so we can hook into the response
    const originalJson = res.json.bind(res);

    res.json = async (body) => {
      // Fire audit log asynchronously so it never blocks the response
      try {
        const details = getDetails ? getDetails(req, body) : {};
        const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';

        await supabaseAdmin.from('audit_logs').insert({
          user_id: req.user?.id || null,
          action_type: actionType,
          target_entity: details.target_entity || req.params?.id ? `${actionType.split('_')[0].toLowerCase()}s:${req.params.id}` : null,
          old_value: details.old_value || null,
          new_value: details.new_value || null,
          ip_address: ip,
        });
      } catch (err) {
        // Never let audit logging crash the response
        console.error('AUDIT LOG ERROR:', err.message);
      }

      return originalJson(body);
    };

    next();
  };
}

module.exports = { auditLog };
