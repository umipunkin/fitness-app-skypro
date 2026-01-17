export const extractWorkoutNumber = (name) => {
  if (!name || typeof name !== "string") return null;
  const match = name.match(/(урок|день|lesson|day)\s*(\d+)/i);
  return match ? parseInt(match[2], 10) : null;
};

export const sortWorkouts = (workouts) => {
  if (!Array.isArray(workouts)) return [];
  return [...workouts].sort((a, b) => {
    const numA = extractWorkoutNumber(a.name);
    const numB = extractWorkoutNumber(b.name);
    if (numA !== null && numB !== null) return numA - numB;
    if (numA !== null) return -1;
    if (numB !== null) return 1;
    return 0;
  });
};
