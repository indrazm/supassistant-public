export const env = {
  get port(): number {
    const port = Number(process.env.PORT);
    return Number.isInteger(port) && port > 0 ? port : 3000;
  },
};
