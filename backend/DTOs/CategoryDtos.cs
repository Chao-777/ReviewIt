namespace ReviewIt.Api.DTOs;

public record CategoryDto(int Id, string Name, string Slug, string? Icon, int ItemCount);
public record CategoryListResponse(IEnumerable<CategoryDto> Categories);
