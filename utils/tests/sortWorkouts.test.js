import { describe, it, expect } from "vitest";
import { sortWorkouts } from "../workoutUtils";

describe("sortWorkouts", () => {
  it("сортирует тренировки по номеру урока", () => {
    const workouts = [
      { name: "Урок 3" },
      { name: "Урок 1" },
      { name: "Урок 2" },
    ];

    const sorted = sortWorkouts(workouts);

    expect(sorted.map((w) => w.name)).toEqual(["Урок 1", "Урок 2", "Урок 3"]);
  });

  it("оставляет элементы без номера в конце", () => {
    const workouts = [
      { name: "Урок 2" },
      { name: "Без номера" },
      { name: "Урок 1" },
    ];

    const sorted = sortWorkouts(workouts);

    expect(sorted.map((w) => w.name)).toEqual([
      "Урок 1",
      "Урок 2",
      "Без номера",
    ]);
  });

  it("элементы без номера сохраняют исходный порядок между собой", () => {
    const workouts = [
      { name: "Без номера A" },
      { name: "Урок 1" },
      { name: "Без номера B" },
    ];

    const sorted = sortWorkouts(workouts);

    expect(sorted.map((w) => w.name)).toEqual([
      "Урок 1",
      "Без номера A",
      "Без номера B",
    ]);
  });

  it("корректно сортирует уроки в смешанных языках", () => {
    const workouts = [
      { name: "lesson 10" },
      { name: "День 2" },
      { name: "day 3" },
      { name: "Урок 1" },
    ];

    const sorted = sortWorkouts(workouts);

    expect(sorted.map((w) => w.name)).toEqual([
      "Урок 1",
      "День 2",
      "day 3",
      "lesson 10",
    ]);
  });
});
