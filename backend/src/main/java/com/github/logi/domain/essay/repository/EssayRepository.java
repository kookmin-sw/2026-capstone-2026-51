package com.github.logi.domain.essay.repository;

import com.github.logi.domain.essay.entity.Essay;
import com.github.logi.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EssayRepository extends JpaRepository<Essay, UUID> {
    List<Essay> findAllByUser(User user);
}
