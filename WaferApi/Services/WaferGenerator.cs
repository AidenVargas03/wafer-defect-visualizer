using WaferApi.Models;

namespace WaferApi.Services;

public static class WaferGenerator
{
    public static List<DefectPoint> Generate(
        int gridSize = 20,
        string lotId = "DEMO-LOT",
        string waferId = "DEMO-W01")
    {
        var random = new Random(42); // fixed seed = same wafer every time
        var dies = new List<DefectPoint>();

        // Define two defect clusters
        var clusters = new[]
        {
            new { Cx = 5, Cy = 5, Radius = 2.5, Type = "scratch" },
            new { Cx = 14, Cy = 13, Radius = 3.0, Type = "oxide" },
        };

        for (int x = 0; x < gridSize; x++)
        {
            for (int y = 0; y < gridSize; y++)
            {
                // Skip corner dies (simulate circular wafer)
                double distFromCenter = Math.Sqrt(
                    Math.Pow(x - gridSize / 2.0, 2) +
                    Math.Pow(y - gridSize / 2.0, 2));
                if (distFromCenter > gridSize / 2.0) continue;

                // Check proximity to each cluster
                string defectType = "particle";
                double failProb = 0.03; // baseline 3% random fail rate

                foreach (var cluster in clusters)
                {
                    double dist = Math.Sqrt(
                        Math.Pow(x - cluster.Cx, 2) +
                        Math.Pow(y - cluster.Cy, 2));

                    if (dist <= cluster.Radius)
                    {
                        failProb = 0.85;
                        defectType = cluster.Type;
                        break;
                    }
                }

                bool pass = random.NextDouble() > failProb;

                dies.Add(new DefectPoint(
                    DieX: x,
                    DieY: y,
                    DefectType: defectType,
                    LotId: lotId,
                    WaferId: waferId,
                    Pass: pass
                ));
            }
        }

        return dies;
    }
}