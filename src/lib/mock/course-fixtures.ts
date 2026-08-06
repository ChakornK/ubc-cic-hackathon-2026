// Course and tuition fixtures for mock mode, shaped exactly like tool results
// (section times already "HH:MM" per api-spec.md).

import type { CourseDoc, TuitionResult } from "@/src/lib/api-types";

export const MOCK_COURSES: CourseDoc[] = [
  {
    code: "CPSC_V 100",
    subject: "CPSC",
    number: "100",
    title: "Computational Thinking",
    description:
      "Meaning and impact of computational thinking. Solving problems using computational thinking, testing, debugging. How computers work. No prior computing experience required.",
    credits: 3,
    prerequisite: null,
    corequisite: null,
    sections: [
      { section: "101", term: "2026W1", days: ["t", "th"], start_time: "11:00", end_time: "12:30", instructor: "Sitar, P." },
    ],
  },
  {
    code: "CPSC_V 203",
    subject: "CPSC",
    number: "203",
    title: "Programming, Problem Solving, and Algorithms",
    description:
      "Analysis of increasingly complex algorithmic problems, using a modern programming language and a variety of approaches. Problem decomposition, abstraction, and data organization.",
    credits: 3,
    prerequisite: null,
    corequisite: null,
    sections: [
      { section: "201", term: "2026W2", days: ["m", "w", "f"], start_time: "12:00", end_time: "13:00", instructor: "Aziz, H." },
    ],
  },
  {
    code: "CPSC_V 110",
    subject: "CPSC",
    number: "110",
    title: "Computation, Programs, and Programming",
    description:
      "Fundamental program and computation structures. Introductory programming skills. Computation as a tool for information processing, simulation and modelling, and interacting with the world.",
    credits: 4,
    prerequisite: null,
    corequisite: null,
    sections: [
      { section: "101", term: "2026W1", days: ["m", "w", "f"], start_time: "10:00", end_time: "11:00", instructor: "Carter, G." },
      { section: "102", term: "2026W1", days: ["t", "th"], start_time: "15:30", end_time: "17:00", instructor: "Reid, F." },
    ],
  },
  {
    code: "CPSC_V 210",
    subject: "CPSC",
    number: "210",
    title: "Software Construction",
    description:
      "Design, development, and analysis of robust software components. Topics such as software design, computational models, data structures, debugging, and testing.",
    credits: 4,
    prerequisite: "One of CPSC 110, CPSC 107.",
    corequisite: null,
    sections: [
      { section: "101", term: "2026W1", days: ["m", "w", "f"], start_time: "13:00", end_time: "14:00", instructor: "Nakata, M." },
    ],
  },
  {
    code: "CPSC_V 213",
    subject: "CPSC",
    number: "213",
    title: "Introduction to Computer Systems",
    description:
      "Software architecture, operating systems, and I/O architectures. Relationships between application software, operating systems, and computing hardware.",
    credits: 4,
    prerequisite: "All of CPSC 121, CPSC 210.",
    corequisite: null,
    sections: [
      { section: "203", term: "2026W2", days: ["t", "th"], start_time: "09:30", end_time: "11:00", instructor: "Osei, K." },
    ],
  },
  {
    code: "CPSC_V 221",
    subject: "CPSC",
    number: "221",
    title: "Basic Algorithms and Data Structures",
    description:
      "Design and analysis of basic algorithms and data structures; efficiency of algorithms; queues, stacks, hash tables, binary trees, and graphs.",
    credits: 4,
    prerequisite: "One of CPSC 210, CPEN 221 and one of CPSC 121, MATH 220.",
    corequisite: null,
    sections: [
      { section: "101", term: "2026W1", days: ["m", "w", "f"], start_time: "14:00", end_time: "15:00", instructor: "Volkova, A." },
      { section: "201", term: "2026W2", days: ["m", "w", "f"], start_time: "11:00", end_time: "12:00" },
    ],
  },
  {
    code: "CPSC_V 310",
    subject: "CPSC",
    number: "310",
    title: "Introduction to Software Engineering",
    description:
      "Specification, design, validation, and evolution of software at scale. Teamwork on a substantial project using modern development and analysis tools.",
    credits: 4,
    prerequisite: "One of CPSC 210, CPEN 221 and one of CPSC 213, CPEN 211.",
    corequisite: null,
    sections: [
      { section: "101", term: "2026W1", days: ["t", "th"], start_time: "12:30", end_time: "14:00", instructor: "Haas, D." },
    ],
  },
  {
    code: "CPSC_V 320",
    subject: "CPSC",
    number: "320",
    title: "Intermediate Algorithm Design and Analysis",
    description:
      "Systematic study of basic concepts and techniques in the design and analysis of algorithms, illustrated from various problem areas.",
    credits: 3,
    prerequisite: "One of CPSC 221, CPSC 260, EECE 320 and one of MATH 200, MATH 226, MATH 253.",
    corequisite: null,
    sections: [
      { section: "202", term: "2026W2", days: ["m", "w", "f"], start_time: "09:00", end_time: "10:00", instructor: "Bergmann, T." },
    ],
  },
  {
    code: "CPSC_V 330",
    subject: "CPSC",
    number: "330",
    title: "Applied Machine Learning",
    description:
      "Application of machine learning tools, with an emphasis on solving practical problems: data cleaning, supervised learning, feature engineering, and model interpretation.",
    credits: 3,
    prerequisite: "One of CPSC 203, CPSC 210, CPEN 221.",
    corequisite: null,
    sections: [
      { section: "101", term: "2026W1", days: ["t", "th"], start_time: "17:00", end_time: "18:30", instructor: "Molnar, E." },
    ],
  },
  {
    code: "ANTH_V 100",
    subject: "ANTH",
    number: "100",
    title: "Introduction to Cultural Anthropology",
    description:
      "Basic concepts and methods in the anthropological study of culture and society, drawing on case studies from around the world.",
    credits: 3,
    prerequisite: null,
    corequisite: null,
    sections: [
      { section: "001", term: "2026W1", days: ["m", "w"], start_time: "16:00", end_time: "17:30", instructor: "Delgado, R." },
    ],
  },
  {
    code: "MATH_V 100",
    subject: "MATH",
    number: "100",
    title: "Differential Calculus with Applications",
    description:
      "Derivatives of elementary functions, limits, optimization, growth and decay, and related rates, with applications to the sciences.",
    credits: 3,
    prerequisite: null,
    corequisite: null,
    sections: [
      { section: "110", term: "2026W1", days: ["m", "w", "f"], start_time: "08:00", end_time: "09:00", instructor: "Iqbal, S." },
    ],
  },
];

export const MOCK_TUITION: TuitionResult[] = [
  {
    program: "Bachelor of Science",
    program_slug: "bachelor-of-science",
    student_type: "domestic",
    cohort_year: 2026,
    per_credit_cad: 202.13,
  },
  {
    program: "Bachelor of Science",
    program_slug: "bachelor-of-science",
    student_type: "international",
    cohort_year: 2026,
    per_credit_cad: 1494.65,
  },
  {
    program: "Bachelor of Arts",
    program_slug: "bachelor-of-arts",
    student_type: "domestic",
    cohort_year: 2026,
    per_credit_cad: 202.13,
  },
  {
    program: "Bachelor of Arts",
    program_slug: "bachelor-of-arts",
    student_type: "international",
    cohort_year: 2026,
    per_credit_cad: 1387.52,
  },
];
