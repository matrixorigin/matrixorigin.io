package com.ning.codebot.common.domain.dto;

import lombok.Data;

@Data
public class RequestInfo {
    private Long uid;
    public RequestInfo(Long uid) {
        this.uid = uid;
    }
}
