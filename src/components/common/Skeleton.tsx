// src/components/common/Skeleton.tsx
import React from 'react';

/* ================================================================== */
/* PRIMITIVES                                                          */
/* ================================================================== */

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
  animate?: boolean;
}

/** Base shimmer block — everything is built from this. */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  style,
  animate = true,
}) => (
  <div
    className={[
      'bg-gray-200/70 rounded-md',
      animate ? 'animate-pulse motion-reduce:animate-none' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    style={style}
    aria-hidden="true"
  />
);

/** Multi-line text placeholder with organic width variance. */
export const SkeletonText: React.FC<{
  lines?: number;
  lineHeight?: string;
  widths?: string[];
  className?: string;
}> = ({
  lines = 3,
  lineHeight = 'h-3',
  widths = ['w-full', 'w-5/6', 'w-2/3', 'w-3/4', 'w-1/2'],
  className = '',
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={`${lineHeight} ${widths[i % widths.length]}`}
      />
    ))}
  </div>
);

/** Circle placeholder — avatars, icons, badges. */
export const SkeletonCircle: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 40, className = '' }) => (
  <Skeleton
    className={`rounded-full shrink-0 ${className}`}
    style={{ width: size, height: size }}
  />
);

/* ================================================================== */
/* ATOMIC BUILDING BLOCKS                                              */
/* ================================================================== */

/** Single KPI stat card (matches Dashboard/Orders KpiCard). */
export const SkeletonKpiCard: React.FC<{ compact?: boolean }> = ({
  compact = false,
}) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-amber-200/30 ${
      compact ? 'p-3' : 'p-4'
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-2.5 w-20" />
        <Skeleton className={compact ? 'h-5 w-24' : 'h-7 w-28'} />
        <Skeleton className="h-2.5 w-16" />
      </div>
      <Skeleton
        className={`${
          compact ? 'w-9 h-9' : 'w-11 h-11'
        } rounded-lg shrink-0`}
      />
    </div>
  </div>
);

/** Generic white card with a header area + arbitrary body. */
export const SkeletonCard: React.FC<{
  header?: boolean;
  headerWidth?: string;
  className?: string;
  children?: React.ReactNode;
}> = ({ header = true, headerWidth = 'w-40', className = '', children }) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-amber-200/30 p-5 ${className}`}
  >
    {header && (
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <Skeleton className={`h-4 ${headerWidth}`} />
          <Skeleton className="h-2.5 w-56" />
        </div>
        <Skeleton className="h-3 w-20" />
      </div>
    )}
    {children}
  </div>
);

/** Table with header + rows. */
export const SkeletonTable: React.FC<{
  rows?: number;
  cols?: number;
  colWidths?: string[];
  /** Show subtitle under first data cell. */
  showSubtitle?: boolean;
  className?: string;
}> = ({
  rows = 5,
  cols = 5,
  colWidths = ['w-8', 'w-40', 'w-24', 'w-20', 'w-16', 'w-20'],
  showSubtitle = true,
  className = '',
}) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="w-full">
      <thead>
        <tr className="border-b border-amber-200/30">
          {Array.from({ length: cols }).map((_, i) => (
            <th key={i} className="px-3 py-2 text-left">
              <Skeleton className="h-2.5 w-16" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-amber-100/30">
        {Array.from({ length: rows }).map((_, r) => (
          <tr key={r}>
            {Array.from({ length: cols }).map((_, c) => (
              <td key={c} className="px-3 py-3">
                <Skeleton
                  className={`h-4 ${colWidths[c % colWidths.length]}`}
                />
                {showSubtitle && c === 1 && (
                  <Skeleton className="h-2.5 w-28 mt-2" />
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/** Progress-bar-style list row (shops, categories, top products). */
export const SkeletonListRow: React.FC<{ showBar?: boolean }> = ({
  showBar = true,
}) => (
  <div className="flex flex-col md:flex-row md:items-center gap-3 p-3">
    <div className="flex items-center gap-3 md:w-64 shrink-0">
      <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-2.5 w-40" />
      </div>
    </div>
    {showBar && (
      <div className="flex-1">
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    )}
    <div className="flex items-center gap-4 md:w-72 shrink-0">
      <div className="space-y-1.5 text-right flex-1">
        <Skeleton className="h-3.5 w-20 ml-auto" />
        <Skeleton className="h-2.5 w-12 ml-auto" />
      </div>
      <div className="space-y-1.5 text-right flex-1">
        <Skeleton className="h-3 w-14 ml-auto" />
        <Skeleton className="h-2.5 w-12 ml-auto" />
      </div>
    </div>
  </div>
);

/** Grid/list of product or media cards. */
export const SkeletonCardGrid: React.FC<{
  count?: number;
  cols?: string;
  aspect?: string;
}> = ({
  count = 8,
  cols = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  aspect = 'aspect-square',
}) => (
  <div className={`grid ${cols} gap-4`}>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden"
      >
        <Skeleton className={`${aspect} w-full rounded-none`} />
        <div className="p-3 space-y-2">
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="h-2.5 w-1/2" />
          <Skeleton className="h-4 w-20 mt-1" />
        </div>
      </div>
    ))}
  </div>
);

/** Avatar + name + meta row (users list, comments, activity feed). */
export const SkeletonUserRow: React.FC = () => (
  <div className="flex items-center gap-3 p-3">
    <SkeletonCircle size={40} />
    <div className="flex-1 min-w-0 space-y-1.5">
      <Skeleton className="h-3.5 w-32" />
      <Skeleton className="h-2.5 w-48" />
    </div>
    <Skeleton className="h-6 w-16 rounded-full shrink-0" />
  </div>
);

/** Chart placeholder — pass bars=true for bar-style, else line block. */
export const SkeletonChart: React.FC<{
  height?: string;
  bars?: boolean;
  className?: string;
}> = ({ height = 'h-64', bars = false, className = '' }) => (
  <div className={`${height} ${className}`}>
    {bars ? (
      <div className="flex items-end gap-2 h-full pt-4">
        {[40, 65, 45, 80, 55, 70, 50, 75, 60, 85].map((h, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    ) : (
      <div className="relative h-full pt-4">
        <Skeleton className="absolute inset-x-0 top-1/3 h-px" />
        <Skeleton className="absolute inset-x-0 top-2/3 h-px" />
        <Skeleton className="w-full h-full rounded-lg opacity-40" />
      </div>
    )}
  </div>
);

/** Form field skeleton (label + input). */
export const SkeletonField: React.FC<{ wide?: boolean }> = ({
  wide = false,
}) => (
  <div className={`space-y-2 ${wide ? 'md:col-span-2' : ''}`}>
    <Skeleton className="h-2.5 w-20" />
    <Skeleton className="h-10 w-full rounded-lg" />
  </div>
);

/* ================================================================== */
/* PAGE-LEVEL COMPOSITES                                               */
/* ================================================================== */

/** Page header — title + subtitle + optional action buttons. */
export const SkeletonPageHeader: React.FC<{
  actions?: boolean;
  className?: string;
}> = ({ actions = true, className = '' }) => (
  <div
    className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${className}`}
  >
    <div className="space-y-2">
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-3 w-72" />
    </div>
    {actions && (
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-32 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    )}
  </div>
);

/** KPI row (4 tiles by default). */
export const SkeletonKpiRow: React.FC<{ count?: number }> = ({
  count = 4,
}) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonKpiCard key={i} />
    ))}
  </div>
);

/* ---------------- Dashboard ---------------- */

export const SkeletonDashboard: React.FC = () => (
  <div className="p-4 md:p-6 space-y-6">
    <SkeletonPageHeader />

    <SkeletonKpiRow count={4} />

    {/* profit hero */}
    <div className="rounded-xl p-6 border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-9 w-56" />
            <Skeleton className="h-2.5 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 w-full md:w-72">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      </div>
    </div>

    <SkeletonCard>
      <Skeleton className="h-8 w-full rounded-lg mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-4" />
        ))}
      </div>
    </SkeletonCard>

    <SkeletonCard headerWidth="w-56">
      <SkeletonTable rows={6} cols={6} />
    </SkeletonCard>

    <SkeletonCard headerWidth="w-64">
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonListRow key={i} />
        ))}
      </div>
    </SkeletonCard>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  </div>
);

/* ---------------- Profile ---------------- */

export const SkeletonProfile: React.FC = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 opacity-40" />
        <div className="px-6 pb-6 -mt-12">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <SkeletonCircle size={96} className="ring-4 ring-white" />
            <div className="flex-1 space-y-3 pb-2">
              <Skeleton className="h-6 w-48 mx-auto md:mx-0" />
              <Skeleton className="h-3 w-56 mx-auto md:mx-0" />
              <div className="flex gap-2 justify-center md:justify-start">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
            <div className="flex gap-2 pb-2">
              <Skeleton className="h-9 w-32 rounded-lg" />
              <Skeleton className="h-9 w-36 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <SkeletonKpiCard key={i} compact />
        ))}
      </div>

      {[0, 1, 2].map((i) => (
        <SkeletonCard key={i}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            {Array.from({ length: 6 }).map((_, j) => (
              <div key={j} className="space-y-2">
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </div>
        </SkeletonCard>
      ))}
    </div>
  </div>
);

/* ---------------- Generic list/table page (Users, Orders, Products…) ---------------- */

export const SkeletonListPage: React.FC<{
  rows?: number;
  cols?: number;
  /** Show KPI row above the table. */
  kpis?: boolean;
  /** Show toolbar (search + filters) above the table. */
  toolbar?: boolean;
}> = ({ rows = 8, cols = 6, kpis = false, toolbar = true }) => (
  <div className="p-4 md:p-6 space-y-6">
    <SkeletonPageHeader />

    {kpis && <SkeletonKpiRow count={4} />}

    {toolbar && (
      <div className="flex flex-col md:flex-row gap-3">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-40 rounded-lg" />
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>
    )}

    <SkeletonCard header={false}>
      <SkeletonTable rows={rows} cols={cols} />
    </SkeletonCard>
  </div>
);

/* ---------------- Users page (avatar rows) ---------------- */

export const SkeletonUsersPage: React.FC<{ rows?: number }> = ({
  rows = 10,
}) => (
  <div className="p-4 md:p-6 space-y-6">
    <SkeletonPageHeader />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <SkeletonKpiCard key={i} />
      ))}
    </div>
    <SkeletonCard header={false}>
      <div className="divide-y divide-amber-100/30">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonUserRow key={i} />
        ))}
      </div>
    </SkeletonCard>
  </div>
);

/* ---------------- Analytics / reports ---------------- */

export const SkeletonAnalyticsPage: React.FC = () => (
  <div className="p-4 md:p-6 space-y-6">
    <SkeletonPageHeader />

    <SkeletonKpiRow count={4} />

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <SkeletonCard headerWidth="w-48">
        <SkeletonChart height="h-64" bars />
      </SkeletonCard>
      <SkeletonCard headerWidth="w-48">
        <SkeletonChart height="h-64" />
      </SkeletonCard>
    </div>

    <SkeletonCard headerWidth="w-56">
      <SkeletonTable rows={5} cols={5} />
    </SkeletonCard>
  </div>
);

/* ---------------- Product grid / shop ---------------- */

export const SkeletonProductGrid: React.FC<{ count?: number }> = ({
  count = 8,
}) => (
  <div className="p-4 md:p-6 space-y-6">
    <SkeletonPageHeader />
    <div className="flex flex-col md:flex-row gap-3">
      <Skeleton className="h-10 flex-1 rounded-lg" />
      <Skeleton className="h-10 w-40 rounded-lg" />
    </div>
    <SkeletonCardGrid count={count} />
  </div>
);

/* ---------------- Form / create-edit ---------------- */

export const SkeletonFormPage: React.FC<{ fields?: number }> = ({
  fields = 8,
}) => (
  <div className="p-4 md:p-6 space-y-6 max-w-3xl">
    <SkeletonPageHeader actions={false} />
    <SkeletonCard header={false}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {Array.from({ length: fields }).map((_, i) => (
          <SkeletonField key={i} wide={i === fields - 1} />
        ))}
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-100">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
    </SkeletonCard>
  </div>
);

/* ---------------- Detail / view single record ---------------- */

export const SkeletonDetailPage: React.FC = () => (
  <div className="p-4 md:p-6 space-y-6 max-w-5xl">
    <SkeletonPageHeader />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <SkeletonCard>
          <Skeleton className="h-64 w-full rounded-lg mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </SkeletonCard>
        <SkeletonCard>
          <SkeletonText lines={6} />
        </SkeletonCard>
      </div>
      <div className="space-y-4">
        <SkeletonCard header={false}>
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between gap-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </SkeletonCard>
        <SkeletonCard header={false}>
          <Skeleton className="h-10 w-full rounded-lg" />
        </SkeletonCard>
      </div>
    </div>
  </div>
);