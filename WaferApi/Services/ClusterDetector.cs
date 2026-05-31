using WaferApi.Models;

namespace WaferApi.Services;

public static class ClusterDetector
{
    public static List<ClusterResult> FindClusters(List<DefectPoint> points, double eps = 2.0, int minPts = 2)
    {
        var failPoints = points.Where(p => !p.Pass).ToList();
        int n = failPoints.Count;
        var labels = new int[n];
        Array.Fill(labels, -1); // -1 = unvisited

        int clusterId = 0;

        for (int i = 0; i < n; i++)
        {
            if (labels[i] != -1) continue;

            var neighbors = GetNeighbors(failPoints, i, eps);
            if (neighbors.Count < minPts)
            {
                labels[i] = 0; // noise
                continue;
            }

            clusterId++;
            labels[i] = clusterId;

            var seed = new Queue<int>(neighbors);
            while (seed.Count > 0)
            {
                int j = seed.Dequeue();
                if (labels[j] == 0) labels[j] = clusterId;
                if (labels[j] != -1) continue;

                labels[j] = clusterId;
                var jNeighbors = GetNeighbors(failPoints, j, eps);
                if (jNeighbors.Count >= minPts)
                    foreach (var nb in jNeighbors)
                        seed.Enqueue(nb);
            }
        }

        var results = new List<ClusterResult>();
        for (int c = 1; c <= clusterId; c++)
        {
            var members = failPoints
                .Where((_, i) => labels[i] == c)
                .ToList();

            results.Add(new ClusterResult(
                Id: c,
                Size: members.Count,
                CentroidX: Math.Round(members.Average(p => p.DieX), 1),
                CentroidY: Math.Round(members.Average(p => p.DieY), 1),
                MinX: members.Min(p => p.DieX),
                MinY: members.Min(p => p.DieY),
                MaxX: members.Max(p => p.DieX),
                MaxY: members.Max(p => p.DieY)
            ));
        }

        return results;
    }

    private static List<int> GetNeighbors(List<DefectPoint> points, int idx, double eps)
    {
        var neighbors = new List<int>();
        for (int i = 0; i < points.Count; i++)
        {
            if (i == idx) continue;
            double dx = points[idx].DieX - points[i].DieX;
            double dy = points[idx].DieY - points[i].DieY;
            if (Math.Sqrt(dx * dx + dy * dy) <= eps)
                neighbors.Add(i);
        }
        return neighbors;
    }
}

public record ClusterResult(
    int Id,
    int Size,
    double CentroidX,
    double CentroidY,
    int MinX,
    int MinY,
    int MaxX,
    int MaxY
);