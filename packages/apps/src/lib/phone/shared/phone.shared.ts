export const shared = {
  calculateTwilioCostFromCallDuration: ({
    start,
    end,
  }: {
    start: string;
    end: string;
  }) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const duration = (endTime - startTime) / 1000;
    const costPerMinute = 0.013;
    const costPerSecond = costPerMinute / 60;
    const cost = duration * costPerSecond;

    return cost;
  },
};
