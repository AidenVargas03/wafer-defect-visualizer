namespace WaferApi.Models;

public record DefectPoint(
    int DieX,
    int DieY,
    string DefectType,
    string LotId,
    string WaferId,
    bool Pass
);