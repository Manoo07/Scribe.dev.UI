import { Unit, ContentType } from "../types";

// Mock data for demonstration purposes
export const mockUnits: Unit[] = [
  {
    id: "1",
    name: "Introduction to Algebra",
    classroomId: "123e4567-e89b-12d3-a456-426614174000",
    educationalContents: [
      {
        id: "101",
        unitId: "1",
        type: ContentType.NOTE,
        content: `# Introduction to Algebra

Algebra is a branch of mathematics dealing with symbols and the rules for manipulating these symbols. In elementary algebra, those symbols (today written as Latin and Greek letters) represent quantities without fixed values, known as variables.

## Key Concepts

1. **Variables**: Symbols (like x, y, z) that represent numbers
2. **Expressions**: Combinations of variables and operations
3. **Equations**: Statements that two expressions are equal

### Example Problems

- Solve for x: 2x + 5 = 13
- Simplify: 3(x + 2) - 4x`,
        version: 1,
        createdAt: "2023-09-15T10:30:00Z",
        updatedAt: "2023-09-15T10:30:00Z",
      },
      {
        id: "102",
        unitId: "1",
        type: ContentType.LINK,
        content: "https://www.khanacademy.org/math/algebra",
        version: 1,
        createdAt: "2023-09-16T11:20:00Z",
        updatedAt: "2023-09-16T11:20:00Z",
      },
      {
        id: "103",
        unitId: "1",
        type: ContentType.VIDEO,
        content: "https://www.youtube.com/watch?v=NybHckSEQBI",
        version: 1,
        createdAt: "2023-09-17T14:15:00Z",
        updatedAt: "2023-09-17T14:15:00Z",
      },
      {
        id: "104",
        unitId: "1",
        type: ContentType.DOCUMENT,
        content: "algebra_workbook.pdf",
        version: 1,
        createdAt: "2023-09-18T09:45:00Z",
        updatedAt: "2023-09-18T09:45:00Z",
      },
    ],
    createdAt: "2023-09-10T08:00:00Z",
    updatedAt: "2023-09-18T09:45:00Z",
  },
  {
    id: "2",
    name: "Calculus Fundamentals",
    classroomId: "123e4567-e89b-12d3-a456-426614174000",
    educationalContents: [
      {
        id: "201",
        unitId: "2",
        type: ContentType.NOTE,
        content: `# Calculus Fundamentals

Calculus is the mathematical study of continuous change. It has two major branches:
- Differential calculus (concerning rates of change and slopes of curves)
- Integral calculus (concerning accumulation of quantities and the areas under curves)

## Limits

A limit is the value that a function approaches as the input approaches some value.

## Derivatives

The derivative of a function represents its rate of change at a specific point.

## Integrals

Integration is the process of finding the integral of a function, which can be thought of as measuring the area under a curve.`,
        version: 2,
        createdAt: "2023-10-05T13:20:00Z",
        updatedAt: "2023-10-07T09:15:00Z",
      },
      {
        id: "202",
        unitId: "2",
        type: ContentType.VIDEO,
        content: "https://www.youtube.com/watch?v=WUvTyaaNkzM",
        version: 1,
        createdAt: "2023-10-06T10:30:00Z",
        updatedAt: "2023-10-06T10:30:00Z",
      },
      {
        id: "203",
        unitId: "2",
        type: ContentType.DOCUMENT,
        content: "calculus_cheatsheet.pdf",
        version: 1,
        createdAt: "2023-10-08T14:45:00Z",
        updatedAt: "2023-10-08T14:45:00Z",
      },
    ],
    createdAt: "2023-10-01T09:30:00Z",
    updatedAt: "2023-10-08T14:45:00Z",
  },
  {
    id: "3",
    name: "Geometry Basics",
    classroomId: "123e4567-e89b-12d3-a456-426614174000",
    educationalContents: [
      {
        id: "301",
        unitId: "3",
        type: ContentType.NOTE,
        content: `# Geometry Basics

Geometry is the branch of mathematics that deals with shapes, sizes, positions, and dimensions of things.

## Points, Lines, and Planes

These are the fundamental building blocks of geometric figures.

## Angles

An angle is formed by two rays with a common endpoint (vertex).

## Triangles

A triangle is a polygon with three edges and three vertices.`,
        version: 1,
        createdAt: "2023-11-10T11:00:00Z",
        updatedAt: "2023-11-10T11:00:00Z",
      },
      {
        id: "302",
        unitId: "3",
        type: ContentType.LINK,
        content: "https://www.mathsisfun.com/geometry/index.html",
        version: 1,
        createdAt: "2023-11-12T15:20:00Z",
        updatedAt: "2023-11-12T15:20:00Z",
      },
    ],
    createdAt: "2023-11-05T10:15:00Z",
    updatedAt: "2023-11-12T15:20:00Z",
  },
];
