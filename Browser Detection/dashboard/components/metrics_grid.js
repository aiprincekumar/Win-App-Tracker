\uFEFF// Metrics Grid Component
export const MetricsGrid = {
  updateTodayTime: (time) => {
    const el = document.getElementById('trackMetricTodayTime');
    if (el) el.textContent = time;
  },
  // Add other metric update methods here...
};
