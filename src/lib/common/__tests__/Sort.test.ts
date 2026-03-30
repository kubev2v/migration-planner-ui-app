import { expect, it } from "vitest";

import { sortByNewestFirst } from "../Sort";

it("sortByNewestFirst", () => {
  expect(
    sortByNewestFirst([
      {
        id: "1",
        createdAt: "2026-04-01T08:12:47.398Z",
      },
      {
        id: "2",
        createdAt: "2026-04-01T08:13:16.227Z",
      },
    ]),
  ).toEqual([
    {
      id: "2",
      createdAt: "2026-04-01T08:13:16.227Z",
    },
    {
      id: "1",
      createdAt: "2026-04-01T08:12:47.398Z",
    },
  ]);
});

it("sortByNewestFirst new filter key", () => {
  expect(
    sortByNewestFirst(
      [
        {
          id: "1",
          updatedAt: "2026-04-01T08:12:47.398Z",
        },
        {
          id: "2",
          updatedAt: "2026-04-01T08:13:16.227Z",
        },
      ],
      "updatedAt",
    ),
  ).toEqual([
    {
      id: "2",
      updatedAt: "2026-04-01T08:13:16.227Z",
    },
    {
      id: "1",
      updatedAt: "2026-04-01T08:12:47.398Z",
    },
  ]);
});
