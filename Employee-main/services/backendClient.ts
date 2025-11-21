const simulateLatency = async () => {
  await new Promise((resolve) => setTimeout(resolve, 900));
  if (!navigator.onLine) {
    throw new Error('Network offline');
  }
};

export const backendClient = {
  async punch(payload: unknown) {
    await simulateLatency();
    return { success: true, serverTimestamp: Date.now() };
  },
  async leave(payload: unknown) {
    await simulateLatency();
    return { success: true };
  },
  async ticket(payload: unknown) {
    await simulateLatency();
    return { success: true };
  },
  async mood(payload: unknown) {
    await simulateLatency();
    return { success: true };
  },
};

