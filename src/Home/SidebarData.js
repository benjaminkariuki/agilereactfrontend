import * as AiIcons from "react-icons/ai";

const SidebarData = [
  {
    id: 1,
    title: "Dashboard",
    path: "../dashboard/home",
    iconOpened: <AiIcons.AiFillHome />,
    iconClosed: <AiIcons.AiOutlineHome />,
    role: "", // Rendered for all roles
  },
  {
    id: 2,
    title: "Projects",
    path: "../dashboard/project",
    iconOpened: <AiIcons.AiFillProject />,
    iconClosed: <AiIcons.AiOutlineProject />,
    role: "", // Rendered for all roles
  },
  {
    id: 3,
    title: "Sprints",
    path: "../dashboard/sprints",
    iconOpened: <AiIcons.AiOutlineBorderInner />,
    iconClosed: <AiIcons.AiOutlineBorderOuter />,
    role: "", // Rendered only for all roles
  },
  {
    id: 4,
    title: "Tasks",
    path: "../dashboard/tasks",
    iconOpened: <AiIcons.AiOutlineCheckCircle />,
    iconClosed: <AiIcons.AiOutlineCheckCircle />,
    role: "", // Rendered for all roles
  },
  {
    id: 5,
    title: "Users",
    path: "../dashboard/users",
    iconOpened: <AiIcons.AiOutlineUsergroupAdd />,
    iconClosed: <AiIcons.AiOutlineUsergroupDelete />,
    role: "COO, Project Manager", // Rendered only for COO and Project Manager roles
  },
  {
    id: 6,
    title: "Create User",
    path: "../dashboard/create",
    iconOpened: <AiIcons.AiOutlineUserAdd />,
    iconClosed: <AiIcons.AiOutlineUserAdd />,
    role: "COO", // Rendered only for COO role
  },
];

export default SidebarData;
