const clean = (value) => value.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
export function executeCommand(rawCommand) {
  const command = clean(rawCommand);
  const lower = command.toLowerCase();
  if (/^(play\s+|pause\b|skip\b|next\b)/.test(lower)) {
    const match = command.match(/^play\s+(.+)/i);
    const response = /pause/.test(lower) ? 'Spotify playback paused.' : /skip|next/.test(lower) ? 'Skipped to the next Spotify track.' : `Queued “${match?.[1] || 'your selection'}” in Spotify.`;
    return { intent: 'spotify.playback', status: 'completed', response, metadata: { provider: 'spotify', simulated: true } };
  }
  if (/(youtube|\bwatch\b|\bsearch\b)/.test(lower)) {
    const query = command.replace(/^(search\s+youtube\s+(for\s+)?)|(search\s+for\s+)|(watch\s+)/i, '') || command;
    return { intent: 'youtube.search', status: 'completed', response: `I found YouTube results for “${query}”.`, metadata: { provider: 'youtube', query, simulated: true } };
  }
  if (/(email|inbox|outlook|mail)/.test(lower)) {
    if (/send/.test(lower)) return { intent: 'outlook.draft', status: 'needs_confirmation', response: 'I prepared a secure draft. Connect Microsoft Graph and confirm before sending email.', metadata: { provider: 'outlook', simulated: true } };
    return { intent: 'outlook.read', status: 'completed', response: 'Your latest email is from Maya: “Project review moved to 3 PM.”', metadata: { provider: 'outlook', simulated: true } };
  }
  return { intent: 'unknown', status: 'needs_clarification', response: 'I could not match that request. Try music control, a YouTube search, or an Outlook email action.', metadata: {} };
}
