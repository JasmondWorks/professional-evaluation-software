import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";

interface HistoryChartProps {
  data: any[];
  dataKey: string;
  name: string;
  color?: string;
  formatter?: (val: number) => string;
}

export default function HistoryChart({ data, dataKey, name, color = "#322b80", formatter }: HistoryChartProps) {
  if (!data || data.length < 2) {
    return null; // Need at least two data points to show a trend
  }

  // Sort data chronologically (oldest first)
  const sortedData = [...data].reverse().map(item => ({
    ...item,
    formattedDate: dayjs(item.created_at || item.createdAt).format("MMM D"),
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{name} Trend</h3>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sortedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="formattedDate" tick={{ fontSize: 12, fill: "#6b7280" }} tickMargin={10} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} tickFormatter={formatter} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(value: any) => [formatter ? formatter(Number(value)) : value, name]}
              labelStyle={{ color: "#374151", fontWeight: "bold" }}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={3}
              dot={{ r: 4, fill: color, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
