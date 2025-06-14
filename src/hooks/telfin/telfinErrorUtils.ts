
export const extractErrorCode = (message: string): [string, string] => {
  const match = message.match(/\[([A-Z0-9-]+)\]/);
  if (match) {
    const code = match[1];
    const cleanMessage = message.replace(`[${code}] `, '').trim();
    return [code, cleanMessage];
  }
  return ["", message];
};
