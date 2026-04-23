export interface Project {
  name: string
  section: string
  person?: number
  description: string
  href: string
  subProject?: Project[] | undefined
  hasPreview?: boolean
  obsidianPluginId?: string
}

export type ProjectSection = Record<string, Project[]>

export const projectsData: Project[] = [
  {
    name: "libft",
    section: "42cursus",
    person: 1,
    description: "My very first own library in C",
    href: "https://github.com/42seoul-jgo/libft",
  },
  {
    name: "get_next_line",
    section: "42cursus",
    person: 1,
    description:
      "This project is about programming a function that returns a line read from a file descriptor.",
    href: "https://github.com/42seoul-jgo/get_next_line",
  },
  {
    name: "ft_printf",
    section: "42cursus",
    person: 1,
    description: "The goal of this project is pretty straightforward. I will recode printf(3).",
    href: "https://github.com/42seoul-jgo/ft_printf",
  },
  {
    name: "push_swap",
    section: "42cursus",
    person: 1,
    description:
      "This project will make you sort data on a stack, with a limited set of instructions, using the lowest possible number of actions. To succeed i'll have to manipulate various types of algorithms and choose the most appropriate solution (out of many) for an optimized data sorting.",
    href: "https://github.com/42seoul-jgo/push_swap",
  },
  {
    name: "pipex",
    section: "42cursus",
    person: 1,
    description:
      "This project will let you discover in detail a UNIX mechanism that you already know by using it in your program.",
    href: "https://github.com/42seoul-jgo/pipex",
  },
  {
    name: "fdf",
    section: "42cursus",
    person: 1,
    description:
      "This project is about representing a landscape as a 3D object in which all surfaces are outlined in lines.",
    href: "https://github.com/42seoul-jgo/fdf",
  },
  {
    name: "minishell",
    section: "42cursus",
    person: 2,
    description:
      "This project is about creating a simple shell. My own little bash. will learn a lot about processes and file descriptors.",
    href: "https://github.com/42seoul-jgo/minishell",
  },
  {
    name: "philosophers",
    section: "42cursus",
    person: 1,
    description:
      "In this project, will learn the basics of threading a process. will see how to create threads and will discover mutexes",
    href: "https://github.com/42seoul-jgo/philo",
  },
  {
    name: "cpp_modules",
    section: "42cursus",
    person: 1,
    description: "Object-Oriented Programming a.k.a OOP with C++",
    href: "https://github.com/42seoul-jgo/cpp_modules",
    subProject: [
      {
        name: "cpp_module_00",
        section: "42cursus",
        description:
          "Namespace, class, member functions, stdio stream, initialization lists, static, const, and lots of basic stuff",
        href: "https://github.com/42seoul-jgo/cpp_module_00",
      },
      {
        name: "cpp_module_01",
        section: "42cursus",
        description: "Memory allocation, pointers to members, references, switch statements",
        href: "https://github.com/42seoul-jgo/cpp_module_01",
      },
      {
        name: "cpp_module_02",
        section: "42cursus",
        description: "Ad-hoc polymorphism, operator overloading and Orthodox Canonical class form",
        href: "https://github.com/42seoul-jgo/cpp_module_02",
      },
      {
        name: "cpp_module_03",
        section: "42cursus",
        description: "Inheritance",
        href: "https://github.com/42seoul-jgo/cpp_module_03",
      },
      {
        name: "cpp_module_04",
        section: "42cursus",
        description: "Subtype polymorphism, abstract classes, interfaces",
        href: "https://github.com/42seoul-jgo/cpp_module_04",
      },
      {
        name: "cpp_module_05",
        section: "42cursus",
        description: "Repetition and Exceptions",
        href: "https://github.com/42seoul-jgo/cpp_module_05",
      },
      {
        name: "cpp_module_06",
        section: "42cursus",
        description: "C++ Casts",
        href: "https://github.com/42seoul-jgo/cpp_module_06",
      },
      {
        name: "cpp_module_07",
        section: "42cursus",
        description: "C++ Templates",
        href: "https://github.com/42seoul-jgo/cpp_module_07",
      },
      {
        name: "cpp_module_08",
        section: "42cursus",
        description: "Templated containers, iterators, algorithms",
        href: "https://github.com/42seoul-jgo/cpp_module_08",
      },
      {
        name: "cpp_module_09",
        section: "42cursus",
        description: "The STL (Standard Template Library)",
        href: "https://github.com/42seoul-jgo/cpp_module_09",
      },
    ],
  },
  {
    name: "miniRT",
    section: "42cursus",
    person: 2,
    description:
      "This project is an introduction to the beautiful world of Raytracing. Once completed you will be able to render simple Computer-Generated-Images and will never be afraid of implementing mathematical formulas again.",
    href: "https://github.com/42seoul-jgo/miniRT",
  },
  {
    name: "inception",
    section: "42cursus",
    person: 1,
    description: "This document is a System Administration related exercise.",
    href: "https://github.com/42seoul-jgo/inception",
  },
  {
    name: "webserv",
    section: "42cursus",
    person: 3,
    description:
      "This project is about writing your own HTTP server. You will be able to test it with an actual browser. HTTP is one of the most used protocols on the internet. Knowing its arcane will be useful, even if you won't be working on a website.",
    href: "https://github.com/WebWaveMaker/webserv",
  },
  {
    name: "ft_transcendence",
    section: "42cursus",
    person: 5,
    description:
      'This project is about writing a game server and a client for a game called "ft_transcendence".',
    href: "https://github.com/42ForYou/ft_transcendence",
  },
  {
    name: "obsidian-go-up",
    section: "obsidian",
    person: 1,
    description:
      "obsidian plugin for allows users to quickly navigate to a specified 'parent' page by utilizing a custom property in the page's front matter.",
    href: "https://github.com/JinmuGo/obsidian-go-up",
    obsidianPluginId: "go-up",
  },
  {
    name: "obsidian-theme-by-folder",
    section: "obsidian",
    person: 1,
    description: "Automatically switch Obsidian themes based on the folder of the opened note",
    href: "https://github.com/JinmuGo/obsidian-theme-by-folder",
    obsidianPluginId: "theme-by-folder",
  },
  {
    name: "hey-oldlady",
    section: "hackathon",
    person: 5,
    description: "제주 부모, 육지 자녀 간 안부를 묻는 소통 플랫폼",
    href: "https://github.com/ddol-mang/hey-oldlady",
  },
  {
    name: "aimuse",
    section: "hackathon",
    person: 5,
    description: "언제나 함께하는 AI 도슨트, AIMuse와 전시를 관람하세요 (우수상)",
    href: "https://github.com/2025-IA-x-AI-Hackathon/Hack-gotowork",
  },
  {
    name: "sls",
    section: "CLI",
    person: 1,
    description: "sls is a smart fuzzy CLI selector for SSH config hosts",
    href: "https://github.com/JinmuGo/sls",
  },
] as const satisfies Project[]

export const projects: ProjectSection = projectsData.reduce((acc: ProjectSection, cur) => {
  if (cur.section in acc) {
    acc[cur.section]?.push(cur)
  } else {
    acc[cur.section] = [cur]
  }
  return acc
}, {})

export const findProject = (projects: Project[], name: string) => {
  const project = projects.find((val) => {
    if (val.subProject) {
      return val.subProject.find((subProject) => subProject.name === name)
    }
    return val.name === name
  })

  if (!project) {
    return null
  }

  if (project.subProject) {
    return project.subProject.find((subProject) => subProject.name === name)
  }

  return project
}
