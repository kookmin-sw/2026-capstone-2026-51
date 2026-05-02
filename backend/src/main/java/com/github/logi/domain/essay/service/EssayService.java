package com.github.logi.domain.essay.service;

import com.github.logi.domain.essay.dto.response.EssayListResponse;
import com.github.logi.domain.essay.repository.EssayRepository;
import com.github.logi.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EssayService {

    private final EssayRepository essayRepository;

    public EssayListResponse getEssays(User user) {
        return EssayListResponse.from(essayRepository.findAllByUser(user));
    }
}
