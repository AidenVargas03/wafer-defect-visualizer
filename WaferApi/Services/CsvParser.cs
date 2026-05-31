using WaferApi.Models;

namespace WaferApi.Services;

public static class CsvParser
{
    public static List<DefectPoint> Parse(Stream stream)
    {
        var results = new List<DefectPoint>();
        using var reader = new StreamReader(stream);

        // Skip header line
        var header = reader.ReadLine();
        if (header is null) return results;

        int lineNumber = 1;
        while (!reader.EndOfStream)
        {
            lineNumber++;
            var line = reader.ReadLine();
            if (string.IsNullOrWhiteSpace(line)) continue;

            var parts = line.Split(',');
            if (parts.Length < 6)
            {
                Console.WriteLine($"Skipping malformed line {lineNumber}");
                continue;
            }

            if (!int.TryParse(parts[0].Trim(), out int dieX) ||
                !int.TryParse(parts[1].Trim(), out int dieY))
            {
                Console.WriteLine($"Skipping line {lineNumber}: invalid coordinates");
                continue;
            }

            var point = new DefectPoint(
                DieX: dieX,
                DieY: dieY,
                DefectType: parts[2].Trim(),
                LotId: parts[3].Trim(),
                WaferId: parts[4].Trim(),
                Pass: parts[5].Trim().ToLower() == "pass"
            );

            results.Add(point);
        }

        return results;
    }
}