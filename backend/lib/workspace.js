const WORKSPACE_HEADER = 'x-orderedit-workspace';
const WORKSPACE_ID_PATTERN = /^[a-zA-Z0-9_-]{16,128}$/;

function getWorkspaceId(req) {
  const workspaceId = String(req.get(WORKSPACE_HEADER) || '').trim();
  return WORKSPACE_ID_PATTERN.test(workspaceId) ? workspaceId : null;
}

function requireWorkspace(req, res, next) {
  const workspaceId = getWorkspaceId(req);
  if (!workspaceId) {
    return res.status(400).json({ error: 'Sessione di lavoro mancante o non valida. Aggiorna la pagina e riprova.' });
  }
  req.workspaceId = workspaceId;
  next();
}

module.exports = { getWorkspaceId, requireWorkspace };
