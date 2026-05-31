using WaferApi.Models;

namespace WaferApi.Services;

public static class YieldAnalyzer
{
    public static YieldStats Analyze(List<DefectPoint> points)
    {
        var total = points.Count;
        var passed = points.Count(p => p.Pass);
        var failed = total - passed;
        var yieldPct = total > 0 ? Math.Round((double)passed / total * 100, 1) : 0;

        // Yield by defect type
        var byDefectType = points
            .GroupBy(p => p.DefectType)
            .Select(g => new DefectBreakdown(
                DefectType: g.Key,
                Total: g.Count(),
                Failed: g.Count(p => !p.Pass),
                YieldImpact: Math.Round((double)g.Count(p => !p.Pass) / total * 100, 1)
            ))
            .OrderByDescending(d => d.Failed)
            .ToList();

        // Yield by row (Y position) — shows spatial trends
        var byRow = points
            .GroupBy(p => p.DieY)
            .OrderBy(g => g.Key)
            .Select(g => new RowYield(
                Row: g.Key,
                Total: g.Count(),
                Passed: g.Count(p => p.Pass),
                YieldPct: Math.Round((double)g.Count(p => p.Pass) / g.Count() * 100, 1)
            ))
            .ToList();

        // SPC — mean and control limits on row yields
        var rowYields = byRow.Select(r => r.YieldPct).ToList();
        var mean = rowYields.Average();
        var stdDev = Math.Sqrt(rowYields.Sum(y => Math.Pow(y - mean, 2)) / rowYields.Count);
        var ucl = Math.Round(mean + 3 * stdDev, 1);
        var lcl = Math.Round(Math.Max(0, mean - 3 * stdDev), 1);

        return new YieldStats(
            TotalDies: total,
            PassDies: passed,
            FailDies: failed,
            YieldPct: yieldPct,
            MeanRowYield: Math.Round(mean, 1),
            UCL: ucl,
            LCL: lcl,
            ByDefectType: byDefectType,
            ByRow: byRow
        );
    }
}

public record YieldStats(
    int TotalDies,
    int PassDies,
    int FailDies,
    double YieldPct,
    double MeanRowYield,
    double UCL,
    double LCL,
    List<DefectBreakdown> ByDefectType,
    List<RowYield> ByRow
);

public record DefectBreakdown(
    string DefectType,
    int Total,
    int Failed,
    double YieldImpact
);

public record RowYield(
    int Row,
    int Total,
    int Passed,
    double YieldPct
);