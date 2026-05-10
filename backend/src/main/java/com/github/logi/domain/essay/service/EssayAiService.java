package com.github.logi.domain.essay.service;

import com.github.logi.domain.essay.dto.request.EssayGenerateRequest;
import com.github.logi.domain.essay.dto.request.EssayRecommendRequest;
import com.github.logi.domain.essay.dto.request.EssayRegenerateRequest;
import com.github.logi.domain.essay.dto.response.EssayGenerateResponse;
import com.github.logi.domain.essay.dto.response.EssayRecommendResponse;
import com.github.logi.domain.essay.entity.Essay;
import com.github.logi.domain.essay.entity.EssayQuestion;
import com.github.logi.domain.essay.exception.EssayExceptions;
import com.github.logi.domain.essay.repository.EssayQuestionRepository;
import com.github.logi.domain.experience.repository.ExperienceRepository;
import com.github.logi.domain.user.entity.User;
import com.github.logi.global.embedding.EmbeddingClient;
import com.github.logi.global.llm.LlmClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EssayAiService {

    private static final int RECOMMEND_LIMIT = 5;

    private final EssayQuestionRepository essayQuestionRepository;
    private final ExperienceRepository experienceRepository;
    private final EmbeddingClient embeddingClient;
    private final LlmClient llmClient;
    private final EssayPromptBuilder essayPromptBuilder;

    public EssayGenerateResponse generateResponse(User user, EssayGenerateRequest request) {
        EssayQuestion question = essayQuestionRepository
                .findByIdWithEssayAndExperiences(request.questionId())
                .orElseThrow(EssayExceptions.QUESTION_NOT_FOUND::toException);

        Essay essay = question.getEssay();

        if (!essay.getId().equals(request.essayId())) {
            throw EssayExceptions.QUESTION_ESSAY_MISMATCH.toException();
        }

        if (!essay.getUser().getId().equals(user.getId())) {
            throw EssayExceptions.FORBIDDEN_ESSAY.toException();
        }

        EssayPromptBuilder.Prompt prompt = essayPromptBuilder.buildGeneratePrompt(
                essay, question, question.getExperiences());
        String generated = llmClient.invoke(prompt.system(), prompt.user());

        return new EssayGenerateResponse(generated);
    }

    public EssayGenerateResponse regenerateResponse(User user, EssayRegenerateRequest request) {
        EssayQuestion question = essayQuestionRepository
                .findByIdWithEssayAndExperiences(request.questionId())
                .orElseThrow(EssayExceptions.QUESTION_NOT_FOUND::toException);

        Essay essay = question.getEssay();

        if (!essay.getId().equals(request.essayId())) {
            throw EssayExceptions.QUESTION_ESSAY_MISMATCH.toException();
        }

        if (!essay.getUser().getId().equals(user.getId())) {
            throw EssayExceptions.FORBIDDEN_ESSAY.toException();
        }

        EssayPromptBuilder.Prompt prompt = essayPromptBuilder.buildRegeneratePrompt(
                essay, question, question.getExperiences(),
                request.currentResponse(), request.questionReq());
        String generated = llmClient.invoke(prompt.system(), prompt.user());

        return new EssayGenerateResponse(generated);
    }

    public EssayRecommendResponse recommendExperiences(User user, EssayRecommendRequest request) {
        float[] questionEmbedding = embeddingClient.embed(request.question());
        String embeddingLiteral = toVectorLiteral(questionEmbedding);

        List<ExperienceRepository.RecommendedExperienceView> rows =
                experienceRepository.findRecommendedByEmbedding(
                        user.getId(), embeddingLiteral, RECOMMEND_LIMIT);

        List<EssayRecommendResponse.RelatedExperience> related = rows.stream()
                .map(view -> new EssayRecommendResponse.RelatedExperience(
                        view.getId(),
                        view.getExperienceTitle(),
                        1.0 - view.getDistance()
                ))
                .toList();

        return new EssayRecommendResponse(related);
    }

    private String toVectorLiteral(float[] embedding) {
        StringBuilder sb = new StringBuilder(embedding.length * 8);
        sb.append('[');
        for (int i = 0; i < embedding.length; i++) {
            if (i > 0) {
                sb.append(',');
            }
            sb.append(embedding[i]);
        }
        sb.append(']');
        return sb.toString();
    }
}
