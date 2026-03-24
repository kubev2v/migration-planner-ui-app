import { renderHook } from "@testing-library/react";
import { act } from "react";

import useLocalStorage from "../useLocalStorage";

test("useLocalStorage initial value string", () => {
  expect(
    renderHook(() => useLocalStorage("key1", "abc")).result.current[0],
  ).toBe("abc");
});

test("useLocalStorage initial value boolean", () => {
  expect(
    renderHook(() => useLocalStorage("key2", true)).result.current[0],
  ).toBe(true);
});

test("useLocalStorage initial value object", () => {
  expect(
    renderHook(() => useLocalStorage("key3", { o: 1 })).result.current[0],
  ).toEqual({ o: 1 });
});

test("useLocalStorage initial value null", () => {
  expect(
    renderHook(() => useLocalStorage("key4", null)).result.current[0],
  ).toBe(null);
});

test("useLocalStorage initial value array", () => {
  expect(
    renderHook(() => useLocalStorage("key5", ["a", "b"])).result.current[0],
  ).toEqual(["a", "b"]);
});

test("useLocalStorage can change the value with the second element", () => {
  const { result } = renderHook(() => useLocalStorage("key6", "abc"));
  expect(result.current[0]).toBe("abc");

  act(() => {
    result.current[1]("def");
  });
  expect(result.current[0]).toBe("def");
});

test("useLocalStorage return value previously saved", () => {
  const { result } = renderHook(() => useLocalStorage("key7", "abc"));
  act(() => {
    result.current[1]("def");
  });
  expect(result.current[0]).toBe("def");
  expect(
    renderHook(() => useLocalStorage("key7", "ijk")).result.current[0],
  ).toBe("def");
});

test("useLocalStorage doesn't return value previously saved if version is set", () => {
  const { result } = renderHook(() => useLocalStorage("key8", "abc"));
  act(() => {
    result.current[1]("def");
  });
  expect(result.current[0]).toBe("def");
  expect(
    renderHook(() => useLocalStorage("key8", "ijk", 2)).result.current[0],
  ).toBe("ijk");
});

test("useLocalStorage supports updater function", () => {
  const { result } = renderHook(() => useLocalStorage("key9", 10));
  expect(result.current[0]).toBe(10);

  act(() => {
    result.current[1]((prev) => prev + 5);
  });
  expect(result.current[0]).toBe(15);

  act(() => {
    result.current[1]((prev) => prev * 2);
  });
  expect(result.current[0]).toBe(30);
});

test("useLocalStorage supports updater function with arrays", () => {
  const { result } = renderHook(() => useLocalStorage("key10", ["a", "b"]));
  expect(result.current[0]).toEqual(["a", "b"]);

  act(() => {
    result.current[1]((prev) => [...prev, "c"]);
  });
  expect(result.current[0]).toEqual(["a", "b", "c"]);

  act(() => {
    result.current[1]((prev) => prev.filter((item) => item !== "b"));
  });
  expect(result.current[0]).toEqual(["a", "c"]);
});

test("useLocalStorage supports batched updater functions", () => {
  const { result } = renderHook(() => useLocalStorage("key11", 10));
  expect(result.current[0]).toBe(10);

  act(() => {
    result.current[1]((prev) => prev + 5);
    result.current[1]((prev) => prev * 2);
  });
  expect(result.current[0]).toBe(30);
});
