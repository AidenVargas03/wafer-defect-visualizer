using WaferApi.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:5173",
            "https://wafer-defect-visualizer.vercel.app")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();
app.UseCors("AllowFrontend");

app.MapGet("/", () => "Wafer API is running");

app.MapPost("/api/upload", async (HttpRequest request) =>
{
    if (!request.HasFormContentType)
        return Results.BadRequest("Expected multipart form data");

    var form = await request.ReadFormAsync();
    var file = form.Files.GetFile("file");

    if (file is null || file.Length == 0)
        return Results.BadRequest("No file uploaded");

    if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
        return Results.BadRequest("Only CSV files are accepted");

    using var stream = file.OpenReadStream();
    var points = CsvParser.Parse(stream);

    var total = points.Count;
    var passed = points.Count(p => p.Pass);
    var failed = total - passed;
    var yieldPct = total > 0 ? Math.Round((double)passed / total * 100, 1) : 0;
    var defectTypes = points.Select(p => p.DefectType).Distinct().OrderBy(x => x).ToList();
    var clusters = ClusterDetector.FindClusters(points);

    return Results.Ok(new
    {
        waferId = points.FirstOrDefault()?.WaferId ?? "unknown",
        lotId = points.FirstOrDefault()?.LotId ?? "unknown",
        totalDies = total,
        passDies = passed,
        failDies = failed,
        yieldPct,
        defectTypes,
        clusters,
        dies = points
    });
});

app.MapPost("/api/analyze", async (HttpRequest request) =>
{
    if (!request.HasFormContentType)
        return Results.BadRequest("Expected multipart form data");

    var form = await request.ReadFormAsync();
    var file = form.Files.GetFile("file");

    if (file is null || file.Length == 0)
        return Results.BadRequest("No file uploaded");

    using var stream = file.OpenReadStream();
    var points = CsvParser.Parse(stream);
    var stats = YieldAnalyzer.Analyze(points);
    var clusters = ClusterDetector.FindClusters(points);

    return Results.Ok(new
    {
        stats,
        clusters
    });
});
app.MapGet("/api/demo", () =>
{
    var points = WaferGenerator.Generate();
    var total = points.Count;
    var passed = points.Count(p => p.Pass);
    var failed = total - passed;
    var yieldPct = total > 0 ? Math.Round((double)passed / total * 100, 1) : 0;
    var defectTypes = points.Select(p => p.DefectType).Distinct().OrderBy(x => x).ToList();
    var clusters = ClusterDetector.FindClusters(points);
    var stats = YieldAnalyzer.Analyze(points);

    return Results.Ok(new
    {
        upload = new
        {
            waferId = points.First().WaferId,
            lotId = points.First().LotId,
            totalDies = total,
            passDies = passed,
            failDies = failed,
            yieldPct,
            defectTypes,
            clusters,
            dies = points
        },
        analytics = new { stats, clusters }
    });
});

app.Run();
