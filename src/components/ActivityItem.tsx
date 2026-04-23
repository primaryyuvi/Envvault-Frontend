export const ActivityItem = ({
  user,
  action,
  target,
  targetType = "text",
  time,
  icon,
  iconBg,
  iconColor,
  isLast = false,
}: {
  user: string;
  action: string;
  target: string;
  targetType?: "link" | "code" | "text";
  time: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  isLast?: boolean;
}) => (
  <li>
    <div className="relative pb-8">
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-800"
        />
      )}
      <div className="relative flex space-x-3">
        <div>
          <span
            className={`h-8 w-8 rounded-full ${iconBg} flex items-center justify-center ring-2 ring-slate-900 border ${iconColor.replace("text-", "border-").replace("400", "500/20")}`}
          >
            {icon}
          </span>
        </div>
        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
          <div>
            <p className="text-sm text-slate-400">
              <span className="font-medium text-white">{user}</span> {action}{" "}
              {targetType === "link" && (
                <a
                  href="#"
                  className="font-medium text-blue-400 hover:underline"
                >
                  {target}
                </a>
              )}
              {targetType === "code" && (
                <code className="bg-black/30 text-yellow-500 px-1 py-0.5 rounded text-xs border border-white/5">
                  {target}
                </code>
              )}
              {targetType === "text" && (
                <span className="font-medium text-slate-300">{target}</span>
              )}
            </p>
          </div>
          <div className="text-right text-xs whitespace-nowrap text-slate-600">
            {time}
          </div>
        </div>
      </div>
    </div>
  </li>
);
