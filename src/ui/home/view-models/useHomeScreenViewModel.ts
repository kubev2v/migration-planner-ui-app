import { useLocation, useNavigate } from "react-router-dom";

import { routes } from "../../../routing/Routes";

export type HomeScreenOutletContext = {
  rvtoolsOpenToken?: string;
};

export const useHomeScreenViewModel = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTabKey = location.pathname.startsWith(routes.environments)
    ? 1
    : 0;

  const breadcrumbs = [
    { key: 1, children: "Migration advisor" },
    {
      key: 2,
      children: activeTabKey === 1 ? "environments" : "assessments",
      isActive: true,
    },
  ];

  const handleTabClick = (
    _event: React.MouseEvent<HTMLElement> | React.KeyboardEvent | MouseEvent,
    tabIndex: string | number,
  ): void => {
    const index = typeof tabIndex === "number" ? tabIndex : Number(tabIndex);
    navigate(index === 1 ? routes.environments : routes.assessments);
  };

  return {
    activeTabKey,
    breadcrumbs,
    handleTabClick,
  };
};
