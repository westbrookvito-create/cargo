// Tiny per-owner "waiting for a text reply" state, e.g. after pressing
// "set price" the bot remembers it's waiting for the next message from
// that user to contain the new price.
const pending = new Map();

function setPending(userId, action) {
  pending.set(String(userId), action);
}

function takePending(userId) {
  const key = String(userId);
  const action = pending.get(key);
  pending.delete(key);
  return action;
}

module.exports = { setPending, takePending };
