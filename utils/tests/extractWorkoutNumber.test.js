import { describe, it, expect } from "vitest";
import { extractWorkoutNumber } from "../workoutUtils";

describe("extractWorkoutNumber", () => {
  it("извлекает номер урока из разных форматов", () => {
    expect(extractWorkoutNumber("Урок 1")).toBe(1);
    expect(extractWorkoutNumber("День 5")).toBe(5);
    expect(extractWorkoutNumber("lesson 12")).toBe(12);
    expect(extractWorkoutNumber("day 3")).toBe(3);
  });

  it("возвращает null, если номер не найден", () => {
    expect(extractWorkoutNumber("Без номера")).toBe(null);
    expect(extractWorkoutNumber("Тренировка")).toBe(null);
    expect(extractWorkoutNumber("day")).toBe(null);
  });

  it("правильно работает с разными регистрами", () => {
    expect(extractWorkoutNumber("day 7")).toBe(7);
    expect(extractWorkoutNumber("DAY 7")).toBe(7);
    expect(extractWorkoutNumber("lesson 9")).toBe(9);
    expect(extractWorkoutNumber("LESSON 9")).toBe(9);
  });
});
