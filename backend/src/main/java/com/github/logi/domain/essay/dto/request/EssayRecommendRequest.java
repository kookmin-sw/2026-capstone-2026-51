package com.github.logi.domain.essay.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "관련 경험 추천 요청")
public record EssayRecommendRequest(
        @Schema(description = "자소서 문항", example = "지원 동기를 작성해주세요.")
        @NotBlank String question
) {
}
