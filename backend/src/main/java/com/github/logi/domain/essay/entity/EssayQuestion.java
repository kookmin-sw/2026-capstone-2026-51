package com.github.logi.domain.essay.entity;

import com.github.logi.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "essay_questions")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EssayQuestion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "essay_id", nullable = false)
    private Essay essay;

    @Column(name = "question_num")
    private Integer questionNum;

    @Column(name = "question", columnDefinition = "TEXT", nullable = false)
    private String question;

    @Column(name = "response", columnDefinition = "TEXT", nullable = false)
    private String response;
}
