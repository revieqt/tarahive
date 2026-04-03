import { useSession } from "@/context/SessionContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useNavigate } from "react-router-dom";
import { MdLogout } from "react-icons/md";
import TextField from "@/components/TextField";
import ProfileImage from "@/components/ProfileImage";
import { useState, useRef, useEffect } from "react";

interface SearchItem {
  label: string;
  description: string;
  route: string;
}

export default function TopBar() {
  const { session, clearSession } = useSession();
  const navigate = useNavigate();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "primary");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const searchItems: SearchItem[] = [
    { label: "Dashboard", description: "Main dashboard", route: "/" },
    { label: "Users", description: "User management", route: "/users" },
    { label: "Violation Reports", description: "User management", route: "/users/reports" },
    { label: "Alerts", description: "Alert management", route: "/alerts" },
    { label: "Emergency Monitoring", description: "Alert management", route: "/alerts/emergency-monitoring" },
    { label: "Events", description: "Event management", route: "/events" },
    { label: "User Events Submissions", description: "Event management", route: "/events/submissions" },
    { label: "Content", description: "Content management", route: "/content" },
    { label: "Itinerary Templates", description: "Content management", route: "/content/itinerary-template" },
    { label: "User Analytics", description: "Analytics", route: "/analytics" },
    { label: "Usage Analytics", description: "Analytics", route: "/analytics/usage" },
    { label: "Travel Insights", description: "Analytics", route: "/analytics/travel" },
    { label: "Revenue Analytics", description: "Analytics", route: "/analytics/revenue" },
    { label: "System", description: "System settings", route: "/system" },
    { label: "Logs", description: "System settings", route: "/system/logs" },
    { label: "Role-based Access Control", description: "System settings", route: "/system/rbac" },
    { label: "Profile", description: "User profile", route: "/profile" },
  ];

  const filteredResults = searchQuery
    ? searchItems.filter(
        (item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session?.user) {
    return null;
  }

  const user = session.user;

  const handleLogout = async () => {
    await clearSession();
    navigate("/login");
  };

  const handleSearchItemClick = (route: string) => {
    navigate(route);
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  return (
    <div
      style={{ backgroundColor }}
      className="flex flex-row md:gap-3 justify-end px-2 py-4"
    >
      {/* Search Bar with Dropdown */}
      <div className="flex-1 ml-14 md:flex-none md:w-1/4 relative" ref={searchRef}>
        <TextField
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsSearchOpen(true)}
        />

        {/* Search Dropdown */}
        {isSearchOpen && searchQuery && filteredResults.length > 0 && (
          <div
            style={{
              backgroundColor: primaryColor,
              borderColor: `${primaryColor}60`,
              color: textColor,
            }}
            className="absolute top-12 left-0 right-0 rounded-[10px] shadow-lg border z-50 max-h-64 overflow-y-auto"
          >
            {filteredResults.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSearchItemClick(item.route)}
                className="w-full px-4 py-3 text-left hover:opacity-80 transition-opacity border-b border-white border-opacity-10 last:border-b-0"
              >
                <div className="font-semibold text-sm">{item.label}</div>
                <div className="text-xs opacity-70">{item.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Profile Section - Image + Info + Logout */}
      <div className="flex items-center gap-2 h-12 md:gap-4">
        {/* Profile Button - Redirects to profile page */}
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-3 px-2 py-2 h-12 rounded-[15px] transition-opacity hover:opacity-80 flex-shrink-0"
        >
          {/* Profile Image */}
          <ProfileImage imagePath={user.profileImage} size="medium" />
          {/* Name - Hidden on small screens */}
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-semibold font-poppins">
              {user.fname} {user.lname || ""}
            </span>
            <span className="text-xs opacity-70 font-poppins">{user.type || "User"}</span>
          </div>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="hidden md:flex items-center justify-center p-2 h-10 w-10 rounded-[10px] transition-opacity hover:opacity-80 flex-shrink-0 text-red-500 font-semibold"
          title="Logout"
        >
          <MdLogout size={20} />
        </button>
      </div>
    </div>
  );
}
