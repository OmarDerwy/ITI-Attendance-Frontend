import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useUser } from "@/context/UserContext";
import { useEffect } from "react";

const tabRoutes = [
	{ label: "Lectures", path: "/schedule/lectures" },
	{ label: "Events", path: "/schedule/events" },
];

const ScheduleTabs = () => {
	const navigate = useNavigate();
	const location = useLocation();
    const { userRole } = useUser();
	const currentTab = tabRoutes.findIndex((tab) => location.pathname.startsWith(tab.path));

    // Redirect logic for /schedule root
    useEffect(() => {
        if (location.pathname === "/schedule/" || location.pathname === "/schedule") {
            if (userRole === "student") {
                navigate("/schedule/student", { replace: true });
            } else if (["coordinator", "supervisor"].includes(userRole)) {
                navigate("/schedule/lectures", { replace: true });
            } else {
                navigate("/404", { replace: true });
            }
        }
    }, [location.pathname, userRole, navigate]);

	const handleTabChange = (index) => {
		navigate(tabRoutes[index].path);
	};

	return (
		<Layout>
			<div className="">
				{['coordinator'].includes(userRole) && 
                <Tabs value={String(currentTab)} onValueChange={(val) => handleTabChange(Number(val))} className="mb-5">
					<TabsList className="bg-card border">
						{tabRoutes.map((tab, idx) => (
							<TabsTrigger key={tab.path} value={String(idx)} className="transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-muted/80">
								<span className="">{tab.label}</span>
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>
                }
				<div className="">
					<Outlet />
				</div>
			</div>
		</Layout>
	);
};

export default ScheduleTabs;
