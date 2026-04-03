import { useThemeColor } from "@/hooks/useThemeColor";
import { useSession } from "@/context/SessionContext";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { session } = useSession();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "primary");

  // Dummy data for DAU
  const dauData = [
    { day: 'Mon', users: 2400 },
    { day: 'Tue', users: 2210 },
    { day: 'Wed', users: 2290 },
    { day: 'Thu', users: 2000 },
    { day: 'Fri', users: 2181 },
    { day: 'Sat', users: 2500 },
    { day: 'Sun', users: 2100 },
  ];

  // Dummy data for Feature Usage
  const featureUsageData = [
    { name: 'Maps', value: 35 },
    { name: 'Alerts', value: 25 },
    { name: 'Routes', value: 20 },
    { name: 'Analytics', value: 15 },
    { name: 'Other', value: 5 },
  ];

  const COLORS = ['#00CAFF', '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'];

  // Stats cards
  const stats = [
    { label: 'Total Users', value: '12,543'},
    { label: 'New Monthly Users', value: '1,234'},
    { label: 'Android Users', value: '65%'},
    { label: 'iOS Users', value: '35%'},
  ];

  return (
    <div
      style={{ backgroundColor }}
      className="min-h-screen pt-2 md:p-6 md:pt-2"
    >
      <div className="max-w-7xl mx-auto z-10 relative">
        {/* Welcome Header */}
        <div className="mb-8 mx-5">
          <h1 style={{ color: textColor }} className="text-3xl font-bold font-poppins mb-2">
            Welcome Back, {session?.user?.fname}! 👋
          </h1>
          <p style={{ color: textColor }} className="text-base opacity-70 font-poppins">
            Here's your platform analytics f  or today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4 mx-5">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: `${primaryColor}`,
              }}
              className="rounded-xl p-4"
            >
              <p style={{ color: textColor }} className="text-sm opacity-70 font-poppins">
                {stat.label}
              </p>
              <p style={{ color: textColor }} className="text-3xl font-bold font-poppins mt-2">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mx-5">
          {/* DAU Chart */}
          <div
            style={{
              backgroundColor: `${primaryColor}`,
            }}
            className="rounded-xl p-6"
          >
            <h2 style={{ color: textColor }} className="text-xl font-bold font-poppins mb-6">
              Daily Active Users (DAU)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dauData}>
                <CartesianGrid strokeDasharray="3 3" stroke={`${textColor}20`} />
                <XAxis stroke={`${textColor}60`} />
                <YAxis stroke={`${textColor}60`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: `${backgroundColor}`,
                    border: `1px solid ${primaryColor}`,
                    borderRadius: '8px',
                    color: textColor,
                  }}
                />
                <Legend wrapperStyle={{ color: textColor }} />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#00CAFF"
                  dot={{ fill: '#00CAFF', r: 5 }}
                  activeDot={{ r: 7 }}
                  strokeWidth={2}
                  isAnimationActive={true}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Feature Usage Chart */}
          <div
            style={{
              backgroundColor: `${primaryColor}`,
            }}
            className="rounded-xl p-6 flex flex-col"
          >
            <h2 style={{ color: textColor }} className="text-xl font-bold font-poppins mb-6">
              Feature Usage
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={featureUsageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  isAnimationActive={true}
                  animationDuration={1000}
                >
                  {featureUsageData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: `${backgroundColor}`,
                    border: `1px solid ${primaryColor}`,
                    borderRadius: '8px',
                    color: textColor,
                  }}
                  formatter={(value) => `${value}%`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
